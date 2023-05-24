---
layout: post
title: Strided Convolutions
author: danghoangnhan
categories: [ DL,Convolutional-Neural-Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: false
---

# Understanding Strided Convolutions in Convolutional Neural Networks

Convolutional Neural Networks (CNNs) are a key component in various computer vision tasks, such as image classification, object detection, and image segmentation. One fundamental building block of CNNs is convolutions, which involve sliding a filter over an input image to extract relevant features. In this article, we'll focus on a specific type of convolution called strided convolutions and explore how they work using a simple example.

## What are Strided Convolutions?

To understand strided convolutions, let's start by revisiting the basic concept of convolutions in CNNs. Typically, convolutions involve moving a filter (also known as a kernel) over an input image, computing the element-wise product between the filter and the corresponding region of the image, and summing the results to produce an output feature map.

In standard convolutions, the filter moves one pixel at a time, ensuring that every pixel in the image is considered. However, in strided convolutions, we introduce a concept called the "stride." The stride determines how many pixels the filter moves in each step. By adjusting the stride value, we can control the downsampling of the output feature map and influence the spatial resolution of the extracted features.

## Example of Strided Convolutions

Let's consider a specific example to illustrate how strided convolutions work. Suppose we have a 7x7 image and want to convolve it with a 3x3 filter, but with a stride of 2. This means that instead of moving the filter by 1 pixel at a time, we will "hop" it over 2 pixels in each step. Let's walk through the process:

1. Start at the upper left corner of the image and perform the element-wise multiplication and summation between the filter and the corresponding 3x3 region of the image. This yields an output of 91.

2. Instead of moving the filter by 1 pixel, we now move it by 2 pixels to the right. Applying the same element-wise multiplication and summation, we obtain an output of 100.

3. Repeat the process by moving the filter by 2 pixels again. This time, the output is 83.

4. Proceed to the next row, taking a stride of 2. This means we move the filter down by 2 pixels, skipping one position. The output for this region is 69.

5. Continue moving the filter by 2 pixels to calculate the outputs of 91 and 127 for the next two regions in the row.

6. Finally, move to the last row and compute the outputs of 44, 72, and 74 using the same stride of 2.

By convolving a 7x7 image with a 3x3 filter using a stride of 2, we obtain a 3x3 output feature map. The formula for calculating the output size, given an N by N image, an F by F filter, padding P, and stride S, is as follows:

Output size = (N + 2P - F) / S + 1

In our example, with a 7x7 image, no padding, and a stride of 2, the output size becomes 3x3.

## Benefits and Applications

Strided convolutions offer several advantages in CNNs. By adjusting the stride value, we can control the level of downsampling in the output feature map, which can help reduce computational complexity and memory requirements. Additionally, strided convolutions allow us to balance between preserving fine-grained details and capturing high-level abstract features, depending