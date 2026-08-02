---
layout: post
title: "Intersection over Union"
description: "The overlap metric every detector is scored on, worked with real coordinates, and why two boxes that look close can still fail the 0.5 threshold."

author: danghoangnhan
categories: [ deep-learning, cnn, computer-vision, coursera ]
series: cnn-course
series_order: 22
image: /assets/images/cnn1.png
featured: false
hidden: false
katex: true
viz: true
---

Classification is either right or wrong. Detection is not: a predicted box is never exactly the ground-truth box, so "correct" needs a definition with a number in it.

Intersection over Union is that definition, and essentially every detection result you will read depends on it {% cite everingham2010voc %}.

## The metric

$$\text{IoU}(A, B) \;=\; \frac{|A \cap B|}{|A \cup B|}$$

Both boxes' overlapping area, divided by the total area they jointly cover. It runs from 0 (no overlap) to 1 (identical), and it is scale-invariant — doubling both boxes leaves it unchanged.

The union is easier computed from the intersection than directly:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

## Computing the intersection

For axis-aligned boxes given as $$(x_1, y_1, x_2, y_2)$$ — top-left and bottom-right — the overlap rectangle is bounded by the *inner* edges:

$$x_{\text{left}} = \max(x_1^A, x_1^B), \qquad x_{\text{right}} = \min(x_2^A, x_2^B)$$

$$y_{\text{top}} = \max(y_1^A, y_1^B), \qquad y_{\text{bottom}} = \min(y_2^A, y_2^B)$$

$$|A \cap B| = \max\big(0,\; x_{\text{right}} - x_{\text{left}}\big) \times \max\big(0,\; y_{\text{bottom}} - y_{\text{top}}\big)$$

**The two clamps at zero are the whole implementation.** Without them, disjoint boxes give negative widths whose product is *positive*, and the function confidently reports overlap between boxes at opposite corners of the image. This is the classic IoU bug.

## A worked example

```viz
type: iou
a: 0,0,4,4
size: 4
bx: 1
by: 1
```

Box $$A = (0,0,4,4)$$, box $$B = (1,1,5,5)$$. Both have area 16.

$$x_{\text{left}} = \max(0,1) = 1, \quad x_{\text{right}} = \min(4,5) = 4 \;\Rightarrow\; w = 3$$

$$y_{\text{top}} = \max(0,1) = 1, \quad y_{\text{bottom}} = \min(4,5) = 4 \;\Rightarrow\; h = 3$$

$$|A \cap B| = 9, \qquad |A \cup B| = 16 + 16 - 9 = 23, \qquad \text{IoU} = \frac{9}{23} \approx 0.39$$

Look at the figure and then at that number. The boxes overlap substantially — 9 of 16 units, more than half of each box — and IoU is **0.39**, which fails the conventional 0.5 threshold. The prediction would be scored as a miss.

That gap between visual impression and the metric is the single most useful thing to internalise here. IoU punishes offset far harder than intuition expects, because the union grows at the same time the intersection shrinks.

Drag box B, or step it with the x and y controls, and watch how little it takes. One unit of offset in a single direction already lands at 0.6; one unit diagonally — the figure above — is 0.39. Two units diagonally is 0.14, and the boxes still visibly overlap.

## The 0.5 convention

A detection counts as correct if its IoU with a ground-truth box of the same class is at least 0.5. The threshold is a convention from PASCAL VOC {% cite everingham2010voc %} and it is arbitrary — the paper that introduced it says as much.

COCO {% cite lin2014coco %} reports instead over ten thresholds, $$0.50, 0.55, \ldots, 0.95$$, and averages. That is what "mAP@[.5:.95]" means, and it is why COCO numbers look so much lower than VOC numbers for the same detector: it demands far tighter localisation.

**Never compare a VOC mAP against a COCO mAP.** They are different measurements.

## What actually matters

**IoU is also used during training, not only for scoring, and the two uses differ.** [Anchor boxes](/anchorboxes/) are assigned to ground-truth objects by IoU, and [non-max suppression](/non-max-suppression/) removes duplicates by IoU. Those thresholds are separate hyperparameters from the evaluation threshold and are usually different numbers — conflating them makes detector configurations impossible to read.

**IoU is useless as a loss function, for a specific reason.** For any two boxes that do not overlap, IoU is exactly 0 — whether they are adjacent or at opposite ends of the image. The gradient is zero everywhere in that region, so it cannot pull a badly placed box toward the target. This is why detectors regress box coordinates with a smooth L1 loss instead, and why GIoU adds a penalty term based on the smallest box enclosing both, restoring a usable gradient when they are disjoint {% cite rezatofighi2019giou %}.

**Coordinate conventions are a real source of off-by-one error.** Some codebases store boxes as $$(x, y, w, h)$$ from the centre, others as corners; some treat pixel coordinates as inclusive of the last row, giving widths of $$x_2 - x_1 + 1$$. Mixing conventions produces IoU values that are slightly and consistently wrong, which shifts every threshold decision without ever crashing.

## References

{% bibliography --cited --clear %}
