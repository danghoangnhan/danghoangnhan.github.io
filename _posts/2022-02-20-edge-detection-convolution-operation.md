---
layout: post
title: "Edge Detection and the Convolution Operation"
description: "What the convolution operation actually computes, worked through a vertical edge detector, and why deep learning learns the filter instead of designing it."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 2
image: /assets/images/og/edge-detection-convolution-operation.png
featured: false
hidden: false
katex: true
viz: true
---

Early layers of a convolutional network detect edges. Later layers combine edges into textures, textures into parts, parts into objects {% cite zeiler2014visualizing %}. So edges are where to start — and the operation that finds them is the one the entire architecture is named after.

The idea is older than deep learning. Hubel and Wiesel found cells in the cat visual cortex that respond to edges at particular orientations, with receptive fields covering small patches of the visual field {% cite hubel1962receptive %}; the Neocognitron built a layered network on that observation two decades before backpropagation was applied to it {% cite fukushima1980neocognitron %}{% cite lecun1989backprop %}.

## The operation

Convolution slides a small grid of weights, the **filter** or **kernel**, over the image. At each position it multiplies the overlapping numbers elementwise and sums them into a single output value.

For an input $$I$$ and an $$f \times f$$ kernel $$K$$:

$$S[i,j] \;=\; \sum_{m=0}^{f-1} \sum_{n=0}^{f-1} I[i+m,\; j+n] \; K[m,n]$$

Slide it over every valid position and an $$n \times n$$ input with an $$f \times f$$ filter gives an output of

$$(n - f + 1) \times (n - f + 1)$$

A 6×6 image with a 3×3 filter gives 4×4. That shrinkage is the subject of the [next post on padding](/padding-convolution-neural-network/).

## A vertical edge detector, worked through

Take an image whose left half is bright (10) and right half is dark (0) — a single vertical edge straight down the middle. Convolve it with a filter whose left column is $$1$$, middle column $$0$$, right column $$-1$$:

```viz
type: convolution
n: 6
filter: vertical
stride: 1
padding: 0
```

The highlighted 3×3 window is the first position. Every pixel under it is 10, so the $$+1$$ column contributes $$+30$$, the $$-1$$ column contributes $$-30$$, and they cancel to $$0$$ — flat region, no edge.

Press **next** twice. The window now straddles the boundary: the $$+1$$ column sits on 10s while the $$-1$$ column sits on 0s, and nothing cancels.

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

$$K = \begin{bmatrix} w_1 & w_2 & w_3 \\ w_4 & w_5 & w_6 \\ w_7 & w_8 & w_9 \end{bmatrix}$$

The network can recover Sobel if Sobel is optimal, but it is not restricted to it — it can learn edges at 37°, or filters that respond to texture rather than edges at all, or anything else the loss rewards. Nine numbers, learned from data, and that is one filter in one layer.

Here are the nine numbers, editable. Type into them and watch what the same image becomes:

```viz
type: filter
filter: vertical
```

Two things are worth noticing. Every edge detector has weights **summing to zero** — that is what makes flat regions cancel and only changes survive, and it is why the output sits on mid-grey rather than black. Change one weight so the sum is non-zero and the filter stops detecting edges and starts brightening or darkening the whole picture.

And orientation is not a special property built into the operation. It falls out of where the positive and negative weights sit: swap the rows for the columns and a vertical edge detector becomes a horizontal one.

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
