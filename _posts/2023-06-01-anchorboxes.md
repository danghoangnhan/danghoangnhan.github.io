---
layout: post
title: "Anchor Boxes in Object Detection"
description: "The one-object-per-cell limit anchor boxes remove, the label vector written out in full, and why k-means on the training set beats hand-picked shapes."
author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 24
image: /assets/images/og/anchorboxes.png
featured: false
hidden: false
katex: true
---

A grid-based detector assigns each object to the cell containing its midpoint. That works until two midpoints land in the same cell — a person standing in front of a car, viewed head on — and then the cell has one output slot and two objects.

Anchor boxes give each cell several slots, each specialised to a different object *shape*.

## The label vector without anchors

Each grid cell predicts

$$y = \begin{bmatrix} p_c & b_x & b_y & b_h & b_w & c_1 & c_2 & c_3 \end{bmatrix}^{\mathsf{T}}$$

- $$p_c$$ — is there an object here at all
- $$b_x, b_y$$ — the midpoint, relative to the cell, so both lie in $$[0,1]$$
- $$b_h, b_w$$ — height and width, relative to the whole image, so these can exceed 1 when an object is larger than one cell
- $$c_1, c_2, c_3$$ — the class

Eight numbers, one object. When $$p_c = 0$$ the remaining seven are ignored entirely — the loss does not penalise them, because there is no object whose position they could be wrong about.

## Adding anchors

Choose $$k$$ anchor shapes up front — say a tall narrow one for pedestrians and a wide flat one for cars — and give the cell one full slot per anchor:

$$y = \big[\underbrace{p_c, b_x, b_y, b_h, b_w, c_1, c_2, c_3}_{\text{anchor 1}},\; \underbrace{p_c, b_x, b_y, b_h, b_w, c_1, c_2, c_3}_{\text{anchor 2}}\big]^{\mathsf{T}}$$

With 3 classes and 2 anchors that is 16 numbers per cell. In general the output tensor is

$$n_{\text{grid}} \times n_{\text{grid}} \times \big(k \times (5 + n_{\text{classes}})\big)$$

so a 19×19 grid with 5 anchors and 80 classes gives $$19 \times 19 \times 425$$.

## Assignment: which slot owns which object

Training needs a rule mapping each ground-truth object to exactly one (cell, anchor) pair:

1. the **cell** is the one containing the object's midpoint;
2. the **anchor** is whichever has the highest [IoU](/intersection-over-union/) with the object's shape.

Note what the second step compares. The anchor and the object box are aligned at a common centre and only their *shapes* are compared — an anchor is a width and a height, not a position. A tall thin person matches the tall thin anchor regardless of where in the cell they stand.

Every other slot in that cell is labelled $$p_c = 0$$.

## Choosing the anchor shapes

Hand-picking works and is what the original YOLO did. YOLOv2 replaced it with **k-means over the training set's box dimensions** {% cite redmon2017yolo9000 %}, which is a strictly better idea and comes with one subtlety.

Standard k-means uses Euclidean distance, which would let large boxes dominate the objective — an error of 20 pixels matters far more on a 40-pixel box than a 400-pixel one. So the distance is defined in terms of IoU instead:

$$d(\text{box}, \text{centroid}) = 1 - \text{IoU}(\text{box}, \text{centroid})$$

Clustering under that metric on VOC with $$k = 5$$ gives anchors with better average IoU to the ground truth than 9 hand-picked ones. The shapes are a property of the dataset, not a universal constant — which means anchors tuned for COCO are wrong for aerial imagery or documents.

## What actually matters

**Anchors do not solve the co-located-objects problem, they raise its ceiling.** Two objects of *similar shape* whose midpoints fall in the same cell still collide, because they compete for the same best-IoU anchor. Two pedestrians standing together is exactly this case. More anchors and a finer grid both reduce the frequency; neither eliminates it.

**The anchor count is a genuine cost, not free capacity.** Output size scales linearly with $$k$$, and so does the number of boxes entering [non-max suppression](/non-max-suppression/). The overwhelming majority of slots are background, so raising $$k$$ makes the foreground/background imbalance worse — and that imbalance is severe enough to warrant its own remedies, which is what focal loss was invented for.

**Anchors are a hand-engineered prior, and their removal is where detection went next.** Their shapes, count, and the IoU thresholds for assignment are all tuned quantities — exactly the hand-engineering [part 21](/StateofComputerVision/) predicts for a data-scarce task. Anchor-free detectors (FCOS, CenterNet) and set-prediction models (DETR) drop them entirely, predicting object centres or a fixed set of queries instead, and reach comparable accuracy with fewer knobs.

## References

{% bibliography --cited --clear %}
