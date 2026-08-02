---
layout: post
title: "Pooling Layers in Convolutional Neural Networks"
description: "How max and average pooling downsample a representation, why they have no weights, and why modern architectures increasingly do without them."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 7
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

Pooling shrinks a feature map by replacing each small window with a single summary number. It is the one layer in a ConvNet with **no parameters at all** — nothing about it is learned, and backpropagation has nothing to update.

## Max pooling

Take the window, keep the largest value, discard the rest. With $$f = 2$$, $$s = 2$$ on a 4×4 input:

$$\begin{bmatrix} 1 & 3 & 2 & 1 \\ 2 & 9 & 1 & 1 \\ 1 & 3 & 2 & 3 \\ 5 & 6 & 1 & 2 \end{bmatrix} \;\longrightarrow\; \begin{bmatrix} 9 & 2 \\ 6 & 3 \end{bmatrix}$$

Each 2×2 block collapses to its maximum. The output is half the height and half the width, so a quarter of the values survive.

The output size rule is the same one from [part 4](/strided-convolution/), with the filter size now meaning the pooling window:

$$\left\lfloor \frac{n + 2p - f}{s} \right\rfloor + 1$$

Padding is almost always 0 for pooling, and $$f = s = 2$$ is overwhelmingly the common choice — which is why pooling breaks the odd-filter-size convention from [part 3](/padding-convolution-neural-network/). Nothing needs a centre pixel here, and 2×2 with stride 2 tiles the input exactly, with no overlap and nothing dropped.

## Average pooling

Same window, mean instead of maximum:

$$\begin{bmatrix} 1 & 3 & 2 & 1 \\ 2 & 9 & 1 & 1 \\ 1 & 3 & 2 & 3 \\ 5 & 6 & 1 & 2 \end{bmatrix} \;\longrightarrow\; \begin{bmatrix} 3.75 & 1.25 \\ 3.75 & 2 \end{bmatrix}$$

Max pooling dominates inside networks, and the preference is empirical rather than principled — a direct comparison on recognition tasks found max consistently ahead of average {% cite scherer2010pooling %}. Average pooling survives in one very important place — **global average pooling**, where the window is the entire feature map, turning $$n_H \times n_W \times n_C$$ into $$1 \times 1 \times n_C$$. That single trick is what lets an architecture drop the enormous fully connected layers discussed in [part 6](/one-layer-of-convolotional-network/); it was introduced with Network in Network {% cite lin2014nin %} and adopted by GoogLeNet {% cite szegedy2015googlenet %} and ResNet {% cite he2016resnet %}.

## Pooling acts per channel

This is the detail most often got wrong. Pooling does **not** sum over channels the way convolution does. It runs independently on each channel and the channel count is unchanged:

$$n_H \times n_W \times n_C \;\longrightarrow\; \left\lfloor \frac{n_H - f}{s} \right\rfloor + 1 \;\times\; \left\lfloor \frac{n_W - f}{s} \right\rfloor + 1 \;\times\; n_C$$

Convolution mixes channels and can change their number; pooling never touches them.

## What actually matters

**Pooling has no parameters, but it is not free.** The hyperparameters $$f$$ and $$s$$ are design decisions that permanently discard information — and because there is nothing to learn, the network cannot compensate for a bad choice the way it can with a badly initialised convolution. It also means pooling layers are sometimes not counted as "layers" at all, which is why depth figures for the same network differ between sources.

**The invariance argument is weaker than it is usually stated.** Max pooling is often justified as giving translation invariance: shift the input a pixel and the maximum in the window is often unchanged. That holds for shifts *within* a window and fails at window boundaries, so what you actually get is partial invariance to small shifts, not invariance. Networks are far more robust to translation because of data augmentation and parameter sharing than because of pooling.

**Modern architectures increasingly drop it.** If a stride-2 convolution can downsample and it has learnable weights, the argument for a fixed max is thin — the all-convolutional experiments showed no accuracy loss from replacing pooling with strided convolution {% cite springenberg2015allconv %}, and ResNet uses exactly one max-pool layer, right after the stem. Pooling persists mainly at the very start (cheap early downsampling on a large feature map) and at the very end (global average pooling). The middle of a modern network usually has none.

**Backpropagation through max pooling routes, it does not distribute.** The gradient goes entirely to whichever input held the maximum; every other input in the window gets zero. Average pooling splits the gradient evenly instead. This is worth knowing when a network trains oddly: max pooling makes the gradient signal sparse.

## Source code

- [`Convolution_model_Step_by_Step_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A1) — `pool_forward` implements both modes, and the backward pass shows the routing behaviour above explicitly.

## References

{% bibliography --cited --clear %}
