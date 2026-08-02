---
layout: post
title: "The State of Computer Vision"
description: "The data-versus-hand-engineering spectrum, why detection sits further along it than classification, and which benchmark tricks not to ship."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 21
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
---

A useful way to read the whole series: every machine learning problem sits somewhere on a spectrum between *lots of data* and *lots of hand-engineering*, and where it sits determines what actually helps.

## The spectrum

$$\text{little data} \;\longleftrightarrow\; \text{lots of data}$$

$$\text{more hand-engineering} \;\longleftrightarrow\; \text{simpler algorithms, less structure}$$

With abundant data, simple architectures trained end to end win, and the effort goes into the pipeline. With scarce data the missing information has to come from somewhere else: architectural priors, hand-designed features, augmentation, transfer learning.

Vision has historically sat toward the data-poor end *relative to what the problem demands*. A million images sounds enormous until you consider that the function being learned maps $$10^5$$-dimensional inputs to fine-grained categories. That is why the field produces so much architectural ingenuity — Inception modules, residual connections and depthwise separable convolutions are all structure substituting for data.

Within vision the tasks differ sharply:

| Task | Labelling cost | Typical dataset | Hand-engineering |
|---|---|---|---|
| Classification | one label per image | ImageNet, 1.2M {% cite russakovsky2015ilsvrc %} | less |
| Detection | box + class per object | COCO, ~200K images {% cite lin2014coco %} | more |
| Segmentation | per-pixel labels | far smaller | most |

Drawing a bounding box takes far longer than picking a label, and outlining every object pixel by pixel takes longer still. So detection and segmentation architectures carry much more built-in structure — anchor boxes, region proposals, multi-scale feature pyramids. The [detection posts](/anchorboxes/) that follow are, in this framing, entirely about compensating for scarce labels.

## Two things that win benchmarks and should not ship

**Ensembling.** Train 3–15 networks independently and average their output probabilities. Reliably worth a point or two on a benchmark, and essentially always used by competition winners. It also multiplies inference cost and memory by the number of models, for a gain usually within the noise of simply choosing a better single model.

**Multi-crop at test time.** Run the network on several crops of the test image — corners, centre, and their mirrors, the "10-crop" evaluation — and average. No training cost, but inference cost scales with the number of crops.

Both are legitimate and both are why published numbers sometimes cannot be reproduced from a single forward pass. When comparing architectures, check whether the figures are single-model single-crop; the [ResNet](/resnets-residual-blocks/) and [EfficientNet](/EfficientNet/) tables in this series are, while their headline ILSVRC competition results are not.

## What actually matters

**"Use open-source implementations" is real advice, not a platitude.** These architectures carry a great deal of unstated detail — initialisation schemes, learning-rate schedules, weight decay applied to some parameters and not others, the exact augmentation pipeline. A faithful reimplementation from the paper alone routinely lands a couple of points below the published number, and the gap is almost never in the architecture. Start from released weights and released training code.

**This post's framing is now partly historical, and the reversal is instructive.** The data-poor diagnosis was accurate when vision datasets were ImageNet-sized. Vision transformers subsequently showed that with enough data — hundreds of millions of images — an architecture with *fewer* built-in priors than a ConvNet beats one with more, because what it lacks it can learn instead. Below that data scale, ConvNets still win. The spectrum is right; where vision sits on it moved, and the conclusion moved with it.

**The training recipe now matters as much as the architecture.** ResNet-50 was published at 24.7% top-1 error and reaches roughly 20% under modern schedules, augmentation and regularisation, with no architectural change at all. That is a larger improvement than several generations of architecture search delivered. When a paper claims an architectural win, check whether the baseline received the same recipe — very often it did not.

## References

{% bibliography --cited --clear %}
