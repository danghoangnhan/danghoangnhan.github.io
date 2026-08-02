---
layout: post
title: "One Layer of a Convolutional Network"
description: "A single convolutional layer written out as an equation, mapped onto the dense-layer form it replaces, with the parameter count it actually costs."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 6
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

[Part 5](/convolutions-over-volume/) got as far as a stack of filter outputs. A *layer* is that, plus a bias and a nonlinearity — and it is worth writing next to the dense layer it replaces, because they are the same equation.

## The layer, as an equation

A fully connected layer is

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}, \qquad a^{[l]} = g\big(z^{[l]}\big)$$

A convolutional layer is

$$z^{[l]} = W^{[l]} * a^{[l-1]} + b^{[l]}, \qquad a^{[l]} = g\big(z^{[l]}\big)$$

The only change is that matrix multiplication became convolution. $$W^{[l]}$$ is now the set of filters rather than a dense matrix, and $$b^{[l]}$$ is one scalar per filter, broadcast across every spatial position of that filter's output map. $$g$$ is almost always ReLU, $$\max(0, z)$$.

That is the entire layer. Convolve, add a bias per filter, apply the nonlinearity.

## Shapes

Writing $$l$$ for the layer, with $$f^{[l]}$$ the filter size, $$p^{[l]}$$ the padding, $$s^{[l]}$$ the stride and $$n_C^{[l]}$$ the number of filters:

| Object | Shape |
|---|---|
| Input | $$n_H^{[l-1]} \times n_W^{[l-1]} \times n_C^{[l-1]}$$ |
| Each filter | $$f^{[l]} \times f^{[l]} \times n_C^{[l-1]}$$ |
| Weights | $$f^{[l]} \times f^{[l]} \times n_C^{[l-1]} \times n_C^{[l]}$$ |
| Bias | $$n_C^{[l]}$$ |
| Output | $$n_H^{[l]} \times n_W^{[l]} \times n_C^{[l]}$$ |

with

$$n_H^{[l]} = \left\lfloor \frac{n_H^{[l-1]} + 2p^{[l]} - f^{[l]}}{s^{[l]}} \right\rfloor + 1$$

and the same for $$n_W$$.

## What it costs

The parameter count promised by this post's summary, worked properly. Ten 3×3 filters over a 3-channel input:

$$\underbrace{3 \times 3 \times 3}_{\text{one filter}} = 27 \text{ weights}, \qquad 27 + \underbrace{1}_{\text{bias}} = 28 \text{ per filter}, \qquad 28 \times 10 = 280$$

Now the comparison that matters. Suppose the input is 1000×1000×3, as in [part 1](/computervision/).

| | Parameters |
|---|---|
| Dense layer, 1000 units | $$3 \times 10^{9}$$ |
| Conv layer, ten 3×3 filters | $$280$$ |

Ten million times fewer, and — this is the part that is easy to miss — **the conv number does not change if the image gets bigger**. Feed it 4000×3000 and it is still 280 weights. Only the compute grows.

## Compute, which does depend on image size

$$\text{multiply-adds} \;=\; \underbrace{n_H^{[l]} \cdot n_W^{[l]}}_{\text{positions}} \;\times\; \underbrace{f \cdot f \cdot n_C^{[l-1]}}_{\text{per position}} \;\times\; \underbrace{n_C^{[l]}}_{\text{filters}}$$

Parameters and compute differ by exactly the $$n_H \cdot n_W$$ factor. Keeping the two apart is what makes the [MobileNet](/MobileNet/) and [EfficientNet](/EfficientNet/) arguments legible later — those papers optimise compute, and a model can be small in parameters while being expensive to run.

## What actually matters

**The bias is per filter, not per position.** One scalar shared across the whole output map, exactly as the weights are. Giving each position its own bias would reintroduce the position-dependence that parameter sharing exists to remove — and would add $$n_H n_W n_C$$ parameters, swamping the weights themselves.

**ReLU is not incidental.** Without a nonlinearity between them, any stack of convolutions collapses: convolution is linear, and a composition of linear maps is a single linear map. A hundred-layer network with no activations has exactly the expressive power of one layer. Everything depth buys comes from $$g$$.

**Count parameters by hand when reading a paper.** Architecture diagrams hide where the weights actually live. Do the arithmetic on a VGG-style network and you find the convolutional layers hold a small fraction of the parameters while the fully connected layers hold the overwhelming majority — VGG-16's first dense layer alone is over 100 million weights {% cite simonyan2015vgg %}. That single observation is what motivated global average pooling, and it is invisible unless you multiply the shapes out.

## Source code

- [`Convolution_model_Step_by_Step_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A1) — `conv_forward` builds $$Z$$; the activation is applied on top of it.

## References

{% bibliography --cited --clear %}
