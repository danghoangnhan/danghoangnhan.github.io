---
layout: post
title: "Data Augmentation in Computer Vision"
description: "The standard augmentations and what invariance each one encodes, PCA colour augmentation written out, and why the wrong transform quietly costs accuracy."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 20
image: /assets/images/og/DataAugmentation.png
featured: false
hidden: false
katex: true
---

Vision is almost always data-limited, so augmentation is almost always on. Every transformation you apply is a statement: *this change should not alter the label*. Get that statement wrong and you are training the network to ignore something that matters.

## The standard set

| Transform | Invariance encoded | Watch out for |
|---|---|---|
| Horizontal flip | left–right mirror | text, digits, road signs, anything chiral |
| Random crop / resize | scale and position | cropping the object out entirely |
| Rotation (small) | camera tilt | 6 vs 9, aerial imagery has no canonical up |
| Colour shift | illumination | tasks where colour *is* the label |
| Shear / warp | viewpoint | rarely helps on natural photographs |

Horizontal flipping is the cheapest and most reliable: it doubles the dataset, and for most natural images a mirrored cat is still a cat. Vertical flipping usually is not safe — photographs have a canonical up and satellite images do not, so this is domain-dependent rather than universal.

Random cropping is the workhorse. Take a random sub-rectangle and resize it to the input dimensions. This is also what makes the "resolution" dimension of [EfficientNet](/EfficientNet/) meaningful at training time.

## PCA colour augmentation

The one worth writing out, introduced with AlexNet {% cite krizhevsky2012alexnet %}.

Rather than perturbing R, G and B independently — which produces colours natural images never contain — run PCA over the RGB values of the whole training set and perturb *along the principal axes* of the colour distribution.

For each image, add to every pixel:

$$[\mathbf{p}_1, \mathbf{p}_2, \mathbf{p}_3] \, [\alpha_1 \lambda_1, \; \alpha_2 \lambda_2, \; \alpha_3 \lambda_3]^{\mathsf{T}}$$

where $$\mathbf{p}_i$$ and $$\lambda_i$$ are the eigenvectors and eigenvalues of the 3×3 RGB covariance matrix, and each $$\alpha_i$$ is drawn once per image from $$\mathcal{N}(0, 0.1)$$.

Because the dominant principal component of natural images is overall brightness, this mostly varies intensity and illumination colour together — approximating a change of lighting rather than an arbitrary colour shift. The paper reports it reduced top-1 error by over 1%.

## Where it runs

Augmentation is CPU work — decode, crop, flip, adjust — and it happens while the GPU trains on the previous batch:

$$\underbrace{\text{worker threads: load, augment}}_{\text{CPU}} \;\longrightarrow\; \text{queue} \;\longrightarrow\; \underbrace{\text{forward, backward}}_{\text{GPU}}$$

If the CPU pipeline cannot keep up, the GPU sits idle and augmentation becomes the training bottleneck. A GPU at 40% utilisation on a vision job is usually a data-loading problem, not a model problem.

This is also why augmentation is incompatible with the cached-activation trick from [part 19](/TransferLearning/): the point of augmentation is that each epoch sees different pixels, and the point of caching is that they do not.

## What actually matters

**Augmentation choice is a hyperparameter and it is dataset-specific.** Horizontal flip on a digit classifier teaches the network that a mirrored 2 is a 2. Rotation on aerial imagery is free because there is no canonical orientation; rotation on portraits is not. The right set is not universal, and copying an ImageNet recipe onto a different domain is a real source of silently lost accuracy.

**It regularises — which means it can be too strong.** Augmentation reduces overfitting by making the training distribution wider. Push it far enough and you widen it past the test distribution: the network spends capacity on heavily distorted images it will never see, and both training and validation accuracy fall. If validation accuracy is *above* training accuracy, the augmentation is probably too aggressive.

**Searching the policy beats designing it.** AutoAugment treats the augmentation policy as something to optimise rather than choose, searching over operations and magnitudes, and finds policies that outperform hand-designed ones — including transfer across datasets {% cite cubuk2019autoaugment %}. Later work showed most of the gain comes from much cheaper random policies with tuned magnitude, which is worth knowing before spending compute on a search {% cite shorten2019augmentation %}.

**Augment training data only.** Applying random transforms at validation time makes the metric noisy and not comparable across runs. The exception is deliberate test-time augmentation, which is a separate technique with its own cost — and one of the benchmark tricks [part 21](/StateofComputerVision/) is about.

## Source code

- [`Transfer_learning_with_MobileNet_v1.ipynb`](https://github.com/danghoangnhan/cousera/tree/main/ConvolutionalNeuralNetworks/week2/W2A2) — builds an augmentation pipeline with `RandomFlip` and `RandomRotation` as Keras layers, so the transforms run on-device as part of the model.

## References

{% bibliography --cited --clear %}
