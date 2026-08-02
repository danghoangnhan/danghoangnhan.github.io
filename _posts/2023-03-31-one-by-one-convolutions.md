---
layout: post
title: "1x1 Convolutions and Network in Network"
description: "Why a 1x1 filter is not a no-op, how it becomes a per-pixel fully connected layer across channels, and the bottleneck it makes possible."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 13
image: /assets/images/og/one-by-one-convolutions.png
featured: false
hidden: false
katex: true
---

A 1×1 filter looks pointless. Multiplying each pixel by a single number is scaling, and scaling is not a useful layer.

That intuition is wrong, and it is wrong for the reason established in [part 5](/convolutions-over-volume/): **the filter always spans every input channel**. A "1×1" filter over a 192-channel input is really 1×1×192. It has 192 weights, and it collapses all 192 channels into one number.

## What it actually computes

At each spatial position, take the vector of $$n_C$$ channel values and apply a learned linear map to it, then a nonlinearity:

$$y[i,j,k] \;=\; g\left( \sum_{c=0}^{n_C-1} x[i,j,c] \; W[k,c] \;+\; b_k \right)$$

Compare that with a fully connected layer. It *is* a fully connected layer — over the channel axis, applied independently at every spatial position, with the weights shared across positions. That is the observation behind the name Network in Network {% cite lin2014nin %}: a small neural network applied at each pixel.

So a 1×1 convolution:

- **mixes channels** — every output channel is a learned combination of all input channels
- **does not mix positions** — position $$(i,j)$$ never sees position $$(i',j')$$
- **changes the channel count freely** — $$n_C \rightarrow n_C'$$ for any $$n_C'$$
- **adds a nonlinearity** for the cost of very few parameters

It is precisely the complement of a depthwise convolution, which mixes positions but not channels. [MobileNet](/MobileNet/) is built from pairing the two.

## Shrinking the channel axis

The use that matters. Take a 28×28×192 feature map. To cut it to 32 channels:

$$28 \times 28 \times 192 \;\;\xrightarrow{\;32 \text{ filters of } 1\times1\times192\;}\;\; 28 \times 28 \times 32$$

Spatial size unchanged, channels down 6×, at a cost of $$192 \times 32 + 32 = 6{,}176$$ parameters.

Pooling cannot do this — [pooling never touches the channel axis](/poolinglayers/). Reducing channels is exactly what 1×1 convolution is for, and it has no alternative.

## The bottleneck

Now the arithmetic that makes it worth a post. Suppose you want to apply a 5×5 convolution with 32 output channels to that 28×28×192 map.

**Directly:**

$$\underbrace{28 \times 28 \times 32}_{\text{output positions}} \times \underbrace{5 \times 5 \times 192}_{\text{per position}} \;\approx\; 120 \text{ million multiplies}$$

**Through a bottleneck** — 1×1 down to 16 channels first, then the 5×5:

$$\underbrace{28 \times 28 \times 16 \times (1 \times 1 \times 192)}_{\approx\, 2.4\text{M}} \;+\; \underbrace{28 \times 28 \times 32 \times (5 \times 5 \times 16)}_{\approx\, 10.0\text{M}} \;\approx\; 12.4 \text{ million}$$

**Roughly one tenth the cost**, same input shape, same output shape.

This single trick is load-bearing in three architectures in this series: it is what makes the [Inception module](/Inception-Network-Motivation/) affordable, it is the 1×1 pair wrapping ResNet's bottleneck block, and it is the pointwise half of MobileNet's depthwise separable convolution.

## What actually matters

**The obvious objection is whether squeezing to 16 channels destroys information — and the honest answer is that it can.** The empirical finding is that within reason it does not hurt performance, and the ratio is a hyperparameter tuned per architecture (Inception uses roughly 12:1 here, ResNet's bottleneck 4:1). But "within reason" is doing real work: squeeze too aggressively and accuracy does fall. This is a tuned trade-off, not a free lunch, and papers reporting it usually show the ablation.

**1×1 convolutions are how you make a network fully convolutional.** Because they replace fully connected layers without assuming a fixed input size, a network built from convolutions and 1×1s accepts any input resolution. That property is what makes the convolutional implementation of sliding windows possible, and it is why detection architectures are built this way.

**Nonlinearity per pixel is a real part of the value, not just plumbing.** Even when the channel count is unchanged — $$192 \rightarrow 192$$ — a 1×1 convolution adds representational power, because the linear channel mix is followed by ReLU. It is easy to read 1×1 layers as pure bookkeeping for shapes and miss that they are also adding depth.

## References

{% bibliography --cited --clear %}
