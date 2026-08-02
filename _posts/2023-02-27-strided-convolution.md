---
layout: post
title: "Strided Convolutions"
description: "How stride changes the way a filter moves across an image, the floor in the output-size formula, and when striding beats pooling for downsampling."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 4
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

So far the filter has moved one pixel at a time. **Stride** is the size of that step.

At stride $$s = 2$$ the filter jumps two pixels between positions, horizontally and vertically. It evaluates a quarter as many positions, and the output is roughly half the height and half the width.

## The output size formula

Combining stride with the padding from [part 3](/padding-convolution-neural-network/), an $$n \times n$$ input with an $$f \times f$$ filter, padding $$p$$ and stride $$s$$ gives

$$\left\lfloor \frac{n + 2p - f}{s} \right\rfloor + 1$$

per spatial dimension. The parentheses matter: this is *not* $$n + 2p - f/s + 1$$, which is a more common typo than it should be.

Sanity checks against the earlier posts:

- $$s = 1,\; p = 0$$ gives $$n - f + 1$$, the plain convolution from [part 2](/edge-detection-convolution-operation/).
- $$s = 1,\; p = (f-1)/2$$ gives $$n$$, the "same" convolution from part 3.

### The floor is load-bearing

The floor handles the case where the filter would hang off the edge. Take a 7×7 input, 3×3 filter, $$p = 0$$, $$s = 2$$:

$$\left\lfloor \frac{7 + 0 - 3}{2} \right\rfloor + 1 = 2 + 1 = 3$$

A 3×3 output. Positions start at columns 0, 2 and 4; a fourth position at column 6 would need columns 6, 7 and 8, and 7 and 8 do not exist. The floor discards it.

**Any input pixel not reached by a valid filter position is silently dropped.** With an 8×8 input, 3×3 filter and $$s = 2$$ the output is $$\lfloor 5/2 \rfloor + 1 = 3$$, and the last row and column of the image never influence it at all.

## A worked example

A 7×7 input convolved with a 3×3 filter at $$s = 2$$, no padding, gives a 3×3 output:

| | | |
|---|---|---|
| 91 | 100 | 83 |
| 69 | 91 | 127 |
| 44 | 72 | 74 |

Nine filter positions, nine numbers. Each is the sum of nine products, exactly as in part 2 — the only thing that changed is where the window lands.

## Striding as downsampling

Stride is one of two ways to shrink a feature map; pooling ([part 7](/poolinglayers/)) is the other.

| | Strided convolution | Max pooling |
|---|---|---|
| Parameters | learned | none |
| Downsampling rule | learned from data | fixed — take the max |
| Cost | one convolution, fewer positions | very cheap |

Historically the two were used together: convolve at stride 1, then pool. Modern architectures increasingly drop pooling and downsample with stride-2 convolutions instead, on the argument that a learned reduction beats a fixed one {% cite springenberg2015allconv %}. ResNet {% cite he2016resnet %} does this at each stage transition, and MobileNetV2 {% cite sandler2018mobilenetv2 %} uses stride-2 depthwise convolutions throughout.

## What actually matters

**Stride trades spatial detail for receptive field and compute, and the trade is not reversible.** Every stride-2 layer permanently discards three-quarters of the spatial positions. For classification that is fine and even desirable — the network is heading for a single label. For segmentation or detection it is a problem, which is why those architectures either keep the stride low and pay for it, or use dilated convolutions to grow the receptive field without downsampling, or upsample afterwards and reconnect to the higher-resolution earlier layers.

**The floor makes shapes silently wrong rather than loudly wrong.** A mismatched stride does not raise an error; it hands back a feature map one or two cells smaller than intended, and the problem surfaces layers later as a shape mismatch in a residual addition or a flatten. When a network's shapes do not line up, recompute this formula by hand at each layer before looking anywhere else.

## Source code

- [`Convolution_model_Step_by_Step_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A1) — `conv_forward` takes `stride` as a hyperparameter and derives its output shape with this formula.

## References

{% bibliography --cited --clear %}
