---
layout: post
title: "Why ResNets Work"
description: "Four explanations for the skip connection — easy identity, gradient highways, a smoother loss surface, and implicit ensembles — and what each one gets right."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 12
image: /assets/images/og/why-resnets-work.png
featured: false
hidden: false
katex: true
---

[Part 11](/resnets-residual-blocks/) showed that adding $$a^{[l]}$$ back removes the degradation problem. *Why* it does is less settled than the architecture's ubiquity suggests. There are four explanations. They are not equivalent, and only some of them survive contact with evidence.

## 1. Identity becomes the default

The original argument {% cite he2016resnet %}, and the strongest one.

A residual block computes

$$a^{[l+2]} = g\big(W^{[l+2]} a^{[l+1]} + b^{[l+2]} + a^{[l]}\big)$$

Set $$W^{[l+2]} = 0$$ and $$b^{[l+2]} = 0$$:

$$a^{[l+2]} = g\big(a^{[l]}\big) = a^{[l]}$$

The last step holds because $$a^{[l]}$$ is itself the output of a ReLU and therefore non-negative, and $$\text{ReLU}$$ is the identity on non-negative inputs.

So the block's *easiest* function to represent — the one reached by weight decay pulling weights toward zero — is exactly the identity that a plain network struggled to learn. Adding residual blocks to a working network cannot hurt it, because the new blocks can do nothing at no cost. In a plain network, adding layers forces them to do something, and something is harder than nothing.

## 2. Gradients get a direct path

Differentiate a residual block with respect to its input. Ignoring the outer activation:

$$\frac{\partial a^{[l+2]}}{\partial a^{[l]}} = \frac{\partial F(a^{[l]})}{\partial a^{[l]}} + 1$$

That $$+1$$ is the point. Backpropagating through $$L$$ plain layers multiplies $$L$$ Jacobians together, and if their norms average below 1 the product decays exponentially — the vanishing gradient. Through residual blocks each term is *one plus* something, so the gradient reaching layer $$l$$ contains an unattenuated copy of the gradient from the top.

This is real, and it is why the pre-activation variant {% cite he2016identity %} — moving batch norm and ReLU inside the block so the shortcut is a clean unbroken addition — trains 1000-layer networks where the original ordering stalls.

But it is not the whole story, because plain networks with batch normalisation already have non-vanishing gradients and *still* degrade. Vanishing gradients were largely solved before ResNet, by normalised initialisation and batch norm {% cite ioffe2015batchnorm %}. Something else was still wrong.

## 3. The loss surface gets smoother

Visualising the loss landscape around the trained minimum shows plain deep networks developing a chaotic, highly non-convex surface as depth grows, while the residual version stays comparatively smooth and bowl-shaped {% cite li2018losslandscape %}.

A smoother surface means gradients point somewhere useful over a longer distance, so optimisation finds good minima from more initialisations. This explains the *optimisation* framing of the degradation problem directly: the deeper plain network's solution exists but sits in a landscape gradient descent cannot navigate.

## 4. They behave like ensembles of shallow networks

Unroll a stack of residual blocks. Each block either passes its input through or transforms it, so a network of $$n$$ blocks expands into $$2^n$$ distinct paths of varying length {% cite veit2016ensembles %}.

Deleting a single block from a trained ResNet barely changes accuracy — delete a layer from VGG and it collapses. And the gradient contribution is dominated by the *short* paths; the very long paths contribute almost nothing.

The uncomfortable implication is that a 152-layer ResNet may not be behaving like a 152-layer network at all, but like an ensemble of many shallower ones. That reframes ResNet's depth as something closer to width.

## Which explanation to keep

| Explanation | Explains degradation? | Evidence |
|---|---|---|
| Easy identity | yes, directly | the construction is exact |
| Gradient path | partly | pre-activation trains 1000 layers |
| Smooth landscape | yes | visualisations across depths |
| Implicit ensemble | describes, not explains | layer-deletion experiments |

They are compatible. Identity-by-default and the smoother landscape are the two doing the real work; the gradient argument is often overstated; the ensemble view is best read as a description of the trained result rather than a reason it trains.

## What actually matters

**The order of operations in the block is not cosmetic.** The original block adds *before* the final ReLU, so the shortcut path passes through a nonlinearity at every block. Pre-activation ResNet {% cite he2016identity %} moves the batch norm and ReLU inside the residual branch, leaving the skip path as pure unmodified addition all the way from input to output. That one change is what makes 1000-layer training work, and it is a strong argument that the *cleanliness of the identity path* is the load-bearing property.

**"It fixes vanishing gradients" is the explanation most often given and the weakest one.** Batch normalisation had already largely fixed vanishing gradients, and plain batch-normalised networks still degrade with depth. Repeating the gradient story as *the* answer skips over the fact that it does not account for the observation ResNet was built to explain.

**Beware explanations that only fit after the fact.** The ensemble view is elegant and its experiments are real, but it does not predict that residual networks would train better — it observes properties of ones that already did. Useful for intuition; not a reason to expect the next architecture to work.

## Source code

- [`Residual_Networks.ipynb`](https://github.com/danghoangnhan/cousera/blob/main/ConvolutionalNeuralNetworks/Residual_Networks.ipynb) — the identity block makes claim 1 concrete: zero the block's weights and the output equals the input.

## References

{% bibliography --cited --clear %}
