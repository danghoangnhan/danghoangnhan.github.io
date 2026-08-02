---
layout: post
title: "Edge Detection and the Convolution Operation"
description: "What the convolution operation actually computes, worked through a vertical edge detector, and why deep learning learns the filter instead of designing it."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 2
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

Early layers of a convolutional network detect edges. Later layers combine edges into textures, textures into parts, parts into objects {% cite zeiler2014visualizing %}. So edges are where to start — and the operation that finds them is the one the entire architecture is named after.

## The operation

Convolution slides a small grid of weights, the **filter** or **kernel**, over the image. At each position it multiplies the overlapping numbers elementwise and sums them into a single output value.

For an input $$I$$ and an $$f \times f$$ kernel $$K$$:

$$S[i,j] \;=\; \sum_{m=0}^{f-1} \sum_{n=0}^{f-1} I[i+m,\; j+n] \; K[m,n]$$

Slide it over every valid position and an $$n \times n$$ input with an $$f \times f$$ filter gives an output of

$$(n - f + 1) \times (n - f + 1)$$

A 6×6 image with a 3×3 filter gives 4×4. That shrinkage is the subject of the [next post on padding](/padding-convolution-neural-network/).

## A vertical edge detector, worked through

Take an image whose left half is bright (10) and right half is dark (0) — a single vertical edge straight down the middle. Convolve it with a filter whose left column is $$1$$, middle column $$0$$, right column $$-1$$:

<svg viewBox="0 0 470 224" role="img" aria-labelledby="edge-conv-title" style="max-width:100%;height:auto">
  <title id="edge-conv-title">A 6 by 6 image whose left half is 10 and right half is 0, convolved with a 3 by 3 vertical edge filter, giving a 4 by 4 output with a bright band of 30 down the middle two columns</title>
  <text x="92.0" y="30" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">6 x 6 input</text>
  <rect x="8" y="40" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="8" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="22" y="58" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="40" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="36" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="50" y="58" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="40" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="64" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="78" y="58" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="58" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="58" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="40" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="58" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="8" y="68" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="8" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="22" y="86" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="68" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="36" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="50" y="86" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="68" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="64" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="78" y="86" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="86" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="86" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="86" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="8" y="96" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="8" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="22" y="114" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="96" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="36" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="50" y="114" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="96" width="28" height="28" fill="currentColor" opacity="0.12" />
  <rect x="64" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" opacity="1" />
  <text x="78" y="114" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="114" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="114" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="114" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="8" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="22" y="142" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="50" y="142" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="78" y="142" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="142" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="142" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="142" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="8" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="22" y="170" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="50" y="170" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="78" y="170" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="170" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="170" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="170" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="8" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="22" y="198" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="36" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="50" y="198" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="64" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="78" y="198" text-anchor="middle" font-size="11" fill="currentColor">10</text>
  <rect x="92" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="106" y="198" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="120" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="134" y="198" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="148" y="180" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="162" y="198" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <text x="198" y="124" text-anchor="middle" font-size="18" fill="currentColor">*</text>
  <text x="262.0" y="72.0" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">3 x 3 filter</text>
  <rect x="220" y="82.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="234" y="100.0" text-anchor="middle" font-size="11" fill="currentColor">1</text>
  <rect x="248" y="82.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="262" y="100.0" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="276" y="82.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="290" y="100.0" text-anchor="middle" font-size="11" fill="currentColor">-1</text>
  <rect x="220" y="110.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="234" y="128.0" text-anchor="middle" font-size="11" fill="currentColor">1</text>
  <rect x="248" y="110.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="262" y="128.0" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="276" y="110.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="290" y="128.0" text-anchor="middle" font-size="11" fill="currentColor">-1</text>
  <rect x="220" y="138.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="234" y="156.0" text-anchor="middle" font-size="11" fill="currentColor">1</text>
  <rect x="248" y="138.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="262" y="156.0" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="276" y="138.0" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="290" y="156.0" text-anchor="middle" font-size="11" fill="currentColor">-1</text>
  <text x="326" y="124" text-anchor="middle" font-size="18" fill="currentColor">=</text>
  <text x="404.0" y="58" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">4 x 4 output</text>
  <rect x="348" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="362" y="86" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="376" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="390" y="86" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="404" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="418" y="86" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="432" y="68" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="446" y="86" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="348" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="362" y="114" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="376" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="390" y="114" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="404" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="418" y="114" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="432" y="96" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="446" y="114" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="348" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="362" y="142" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="376" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="390" y="142" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="404" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="418" y="142" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="432" y="124" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="446" y="142" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="348" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="362" y="170" text-anchor="middle" font-size="11" fill="currentColor">0</text>
  <rect x="376" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="390" y="170" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="404" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="418" y="170" text-anchor="middle" font-size="11" fill="currentColor">30</text>
  <rect x="432" y="152" width="28" height="28" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55" />
  <text x="446" y="170" text-anchor="middle" font-size="11" fill="currentColor">0</text>
</svg>

The highlighted 3×3 window is the first position. Every pixel under it is 10, so the $$+1$$ column contributes $$+30$$, the $$-1$$ column contributes $$-30$$, and they cancel to $$0$$ — flat region, no edge.

Slide two steps right and the window straddles the boundary. Now the $$+1$$ column sits on 10s while the $$-1$$ column sits on 0s, and nothing cancels:

$$(10 + 10 + 10) \times 1 \;+\; 0 \;+\; (0 + 0 + 0) \times (-1) \;=\; 30$$

The result is a 4×4 map that is zero everywhere except a band of 30 down the middle — the network has found the edge. Rotate the filter 90° and it finds horizontal edges instead.

The sign carries information too. A light-to-dark edge gives $$+30$$; dark-to-light gives $$-30$$. Take the absolute value and you lose the distinction between the two.

## Hand-designed filters, and why they stopped mattering

Classical vision spent decades designing these by hand. Two you will meet:

| Filter | Weights (left / middle / right column) | Idea |
|---|---|---|
| Sobel | $$1,2,1$$ / $$0,0,0$$ / $$-1,-2,-1$$ | weight the centre row more, for robustness |
| Scharr | $$3,10,3$$ / $$0,0,0$$ / $$-3,-10,-3$$ | stronger centre weighting, better rotational symmetry |

The deep learning move is to stop choosing. Treat all nine numbers as parameters and learn them by backpropagation:

$$K = \begin{bmatrix} w_1 & w_2 & w_3 \ w_4 & w_5 & w_6 \ w_7 & w_8 & w_9 \end{bmatrix}$$

The network can recover Sobel if Sobel is optimal, but it is not restricted to it — it can learn edges at 37°, or filters that respond to texture rather than edges at all, or anything else the loss rewards. Nine numbers, learned from data, and that is one filter in one layer.

## What actually matters

**What deep learning calls "convolution" is really cross-correlation.** The mathematical convolution operator flips the kernel both horizontally and vertically before sliding:

$$(I * K)[i,j] = \sum_m \sum_n I[i-m,\; j-n] \, K[m,n]$$

Note the minus signs. Every deep learning framework — PyTorch's `conv2d`, TensorFlow's `Conv2D` — implements the version *without* the flip, which is cross-correlation. It makes no practical difference because the kernel is learned: if the flipped kernel is what minimises the loss, the network simply learns the flipped kernel. The flip matters for signal-processing identities like associativity, which nobody relies on here. It is worth knowing so the textbook definition and the framework docs stop looking contradictory.

**The filter spans all input channels, always.** The 3×3 filter above is really 3×3×1 because the example is greyscale. On an RGB image it is 3×3×3, and a single output value sums over all 27 products. There is no such thing as a 2-D convolution over a multi-channel input that leaves the channels separate — that is a *depthwise* convolution, a different operation, and the one MobileNet is built on. [Part 5 covers this properly](/convolutions-over-volume/).

**Edge detection is where the intuition starts and stops.** It is a good story for layer one, and layer one really does learn edge-like filters. But nobody has a clean interpretation of what a filter 40 layers down responds to, and the visualisations that suggest otherwise are selected examples. Treat "early layers do edges, late layers do objects" as a rough gradient, not a specification.

## Source code

- [`Convolution_model_Step_by_Step_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week1/W1A1) — implements `conv_single_step` and `conv_forward` from scratch, which is this operation and nothing else.

## References

{% bibliography --cited --clear %}
