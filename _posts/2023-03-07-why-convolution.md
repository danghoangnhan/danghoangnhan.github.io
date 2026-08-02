---
layout: post
title: Unleashing the Power of Convolutional Neural Networks
description: "The 14-million-parameter comparison that justifies convolution, worked in full: parameter sharing, sparse connectivity, and what each one buys."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 8
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

[Part 1](/computervision/) asserted that convolution makes the parameter count tractable. This is the arithmetic behind that claim, on a small enough example to check by hand.

## The comparison

Take a 32×32×3 input and produce a 28×28×6 output — six 5×5 filters, no padding, stride 1.

**As a fully connected layer.** Flatten both sides: $$32 \times 32 \times 3 = 3072$$ inputs, $$28 \times 28 \times 6 = 4704$$ outputs. A dense layer connecting them needs

$$3072 \times 4704 + 4704 \approx 14.5 \text{ million parameters}$$

**As a convolutional layer.** Six filters, each 5×5×3, each with a bias:

$$(5 \times 5 \times 3 + 1) \times 6 = 76 \times 6 = 456 \text{ parameters}$$

| | Parameters |
|---|---|
| Fully connected | ~14,500,000 |
| Convolutional | 456 |

Roughly **32,000×** fewer, for a layer producing the identical output shape. And this is a 32×32 thumbnail — the ratio grows with image size, because the dense count scales with $$n_H^2 n_W^2$$ while the convolutional count does not scale with image size at all.

Two distinct mechanisms produce that gap.

## Mechanism 1: parameter sharing

A feature detector useful in one part of an image is useful in another. A vertical-edge filter does not need to be relearned for the top-left corner and again for the bottom-right — the same 75 weights slide across every position.

The dense layer, by contrast, learns a separate weight for every (input pixel, output unit) pair. It has to discover independently, at every location, that vertical edges matter. It has no way to know that position $$(3,7)$$ and position $$(20,14)$$ are the same *kind* of place.

This is a **hard constraint**, not a hint. The convolutional layer is strictly less expressive than the dense one — it cannot represent a position-dependent transformation. That restriction is the point: it encodes a true fact about images, so it removes exactly the capacity that would otherwise go into overfitting.

## Mechanism 2: sparse connectivity

Each output value depends on only $$f \times f \times n_C$$ inputs — 75 of the 3072, in this example. The other 2997 have no influence on it whatsoever.

In the dense layer every output depends on every input. That sounds strictly better and is not: the pixel in the top-left corner of a photograph tells you essentially nothing about the pixel in the bottom-right, so the dense layer is spending parameters modelling a relationship that is not there.

Distant pixels do eventually interact — after enough layers, the **receptive field** of a deep unit covers the whole image. The interaction is built up hierarchically rather than asserted in one step {% cite luo2016receptivefield %}.

## Translation equivariance, stated correctly

Convolution is **equivariant** to translation: shift the input and the output shifts by the same amount.

$$f(\text{shift}(x)) = \text{shift}(f(x))$$

It is not **invariant** — the output changes, it just changes predictably. Invariance, where the output does not change at all, is what a classifier needs, and it comes later in the network from pooling, from striding, and mostly from global average pooling collapsing spatial position entirely.

Getting these two words the wrong way round is common and makes the pooling discussion in [part 7](/poolinglayers/) incoherent.

## What actually matters

**The saving is a modelling assumption that happens to be true.** Convolution wins on images because images really are locally correlated and really are translation-equivariant. Apply a ConvNet to data without that structure — a table of unrelated tabular features, say — and the same constraints that help here actively hurt, because the network is forbidden from learning relationships that do exist. The lesson generalises: architectural constraints are priors, and a prior is only free when it is correct.

**Sparse connectivity is why the receptive field is a design quantity.** If a unit can only see $$f \times f$$ of the layer beneath, then how much of the original image it can see is determined by the depth, the filter sizes and every stride along the way. A network whose final receptive field is smaller than the objects it must classify cannot work, no matter how it is trained. Effective receptive fields are also substantially smaller than the theoretical ones, with roughly Gaussian falloff {% cite luo2016receptivefield %}.

**14 million versus 456 is the honest comparison only for one layer.** A real dense network would not be built this way, and modern vision transformers dispense with the convolutional prior entirely — succeeding by substituting enormous quantities of data and augmentation for the structure convolution assumes. The parameter argument explains why ConvNets won in 2012, when data was the binding constraint. It is less decisive now, and that is worth holding onto when reading claims about which architecture is "better".

## Source code

- [`Convolution_model_Application.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A2) — builds a small ConvNet and trains it, where the parameter counts above can be read off the model summary directly.

## References

{% bibliography --cited --clear %}
