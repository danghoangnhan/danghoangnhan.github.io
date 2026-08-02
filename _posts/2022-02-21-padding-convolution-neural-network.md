---
layout: post
title: "Understanding Padding in Convolutional Neural Networks"
description: "Why convolution shrinks its input and under-uses the border, the p = (f-1)/2 rule that fixes both, and why filter sizes are almost always odd."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
image: /assets/images/cnn1.png
featured: true
hidden: false
series: cnn-course
series_order: 3
katex: true
---

Plain convolution has two defects. Padding fixes both with one change.

## Defect 1: the image shrinks

An $$n \times n$$ input convolved with an $$f \times f$$ filter produces

$$(n - f + 1) \times (n - f + 1)$$

Each layer costs $$f - 1$$ pixels per side. With 3×3 filters that is 2 pixels a layer, which sounds harmless until the layers stack:

| Layer | Output size (3×3 filters, no padding) |
|---|---|
| input | 224 × 224 |
| 1 | 222 × 222 |
| 5 | 214 × 214 |
| 20 | 184 × 184 |
| 50 | 124 × 124 |
| 111 | 2 × 2 |

A network cannot go much deeper than $$n/2$$ layers before there is nothing left to convolve. VGG-16 is 16 weight layers deep and ResNet-152 is far more {% cite simonyan2015vgg %}{% cite he2016resnet %} — neither is possible if every layer eats the image.

## Defect 2: the border is under-used

Count how many times each input pixel is read. For a 3×3 filter, a pixel in the middle of the image falls under the filter at nine different positions. The pixel in the very corner falls under it exactly **once**.

The network therefore sees interior pixels nine times as often as corner pixels. Information at the edges is systematically down-weighted — not because it matters less, but as an artefact of the geometry.

## The fix

Add a border of $$p$$ zero-valued pixels around the input before convolving. The output becomes

$$(n + 2p - f + 1) \times (n + 2p - f + 1)$$

Now solve for the $$p$$ that leaves the size unchanged. Setting $$n + 2p - f + 1 = n$$ gives

$$p = \frac{f - 1}{2}$$

For a 3×3 filter, $$p = 1$$. For 5×5, $$p = 2$$. For 7×7, $$p = 3$$.

The corner pixel now sits inside a padded border, so it is read as often as any other pixel, and the feature map survives arbitrarily many layers.

The two conventions have names:

- **Valid** — no padding, $$p = 0$$, output $$n - f + 1$$. The name means every filter position lies entirely within real input.
- **Same** — pad so the output matches the input, $$p = (f-1)/2$$.

## Why filter sizes are odd

Look at $$p = (f-1)/2$$ again. If $$f$$ is even then $$p$$ is not an integer, which forces *asymmetric* padding — an extra pixel on the left but not the right. That is implementable but introduces a directional bias with no reason to exist.

Odd $$f$$ also gives the filter a well-defined centre pixel, so a filter's position can be described by a single coordinate.

This is why convolution filters are almost always 1×1, 3×3, 5×5 or 7×7, and essentially never 2×2 or 4×4. Pooling is different — 2×2 is standard there, and [part 7 explains why](/poolinglayers/).

## What actually matters

**Zero is a choice, and a strange one.** Padding with zeros asserts that the world outside the image is uniformly black, which is false. This creates a real artefact: filters learn to respond to the border itself, and a network can infer *absolute position* from how much zero padding a region sees — which partly defeats the translation invariance convolution was supposed to buy. Frameworks offer `reflect`, `replicate` and `circular` padding for this reason. Zero padding is the default because it is cheap and works well enough, not because it is principled.

**"Same" stops meaning same as soon as the stride is not 1.** The rule $$p = (f-1)/2$$ preserves size only at stride 1. With stride $$s$$ the output is $$\lfloor (n + 2p - f)/s \rfloor + 1$$, so TensorFlow's `padding='same'` actually means "output $$\lceil n/s \rceil$$" — the input divided by the stride, not the input. [Part 4 covers strided convolution](/strided-convolution/), and this is a routine source of off-by-one shape errors.

**Padding costs compute.** Going from 224×224 to a padded 226×226 is 1.8% more filter positions to evaluate. Negligible once; it compounds through a deep network, and it is one reason efficient architectures sometimes drop it on their smallest feature maps.

## Source code

- [`Convolution_model_Step_by_Step_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A1) — the `zero_pad` function is exactly this, built on `np.pad`.

## References

{% bibliography --cited --clear %}
