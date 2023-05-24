---
layout: post
title: Inception Network Motivation

author: danghoangnhan
categories: [ DL,Convolutional-Neural-Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: true
---

# Understanding the Inception Network Architecture

When designing a layer for a Convolutional Neural Network (ConvNet), you often have to choose between different filter sizes or decide whether to use a convolutional or pooling layer. The Inception network introduces a novel approach by combining various filter sizes and pooling layers in a single layer, allowing the network to learn the best combinations. In this blog post, we will explore the inception module and how it reduces computational costs while maintaining performance.

## Introduction to the Inception Module

The Inception module is a fundamental building block of the Inception network architecture developed by Christian Szegedy and his team. Instead of selecting a specific filter size or pooling layer, the Inception module incorporates them all. It takes an input volume, applies different filter sizes, and concatenates their outputs to form a composite volume. This approach allows the network to capture features at multiple scales and learn the most relevant representations.

## The Inception Module Structure

Let's consider an example where the input is a 28x28x192-dimensional volume. Instead of choosing a single filter size, the Inception module applies 1x1, 3x3, and 5x5 convolutions, as well as a pooling layer. The 1x1 convolution reduces the input volume to 28x28x64, while the 3x3 and 5x5 convolutions produce volumes of 20x20x128 and 28x28x32, respectively. The pooling layer output matches the dimensions of the input volume, resulting in 28x28x32.

To maintain the consistency of dimensions, the Inception module uses "same" convolutions. The output volumes from different filters are stacked together along the channel dimension, creating a composite volume. In this example, the resulting volume would be 28x28x256 (64+128+32+32).

## Computational Costs of the Inception Layer

While the Inception module provides flexibility and powerful feature extraction, it introduces increased computational costs. For example, considering the 5x5 filter, the cost can be calculated as follows: The input volume is 28x28x192, and we apply a 5x5 same convolution with 32 filters. This results in an output volume of 28x28x32. Each output value requires 5x5x192 multiplications. So, the total number of multiplications for this operation is 120 million.

## Reducing Computational Costs with 1x1 Convolutions

To mitigate the computational costs of the Inception module, the concept of 1x1 convolutions comes into play. By incorporating a 1x1 convolution before the larger filter sizes, we can reduce the number of channels in the intermediate volume. For example, we can apply a 1x1 convolution to the 192-channel input, reducing it to 16 channels before the 5x5 convolution. This effectively acts as a bottleneck layer.

By employing a 1x1 convolution, we reduce the computational cost significantly. In the previous example, the cost was reduced from 120 million multiplications to 12.4 million. The intermediate volume with 16 channels is passed through the 5x5 convolution, resulting in the desired output of 28x28x32.

## Benefits of the Inception Network Architecture

The Inception network architecture allows for increased flexibility in feature extraction by incorporating various filter sizes and pooling layers. By using 1x1 convolutions strategically, it reduces computational costs while maintaining performance. The bottleneck layer enables a significant reduction in the representation size without sacrificing the network's capabilities.

## Conclusion

The Inception network, with its inception module, presents an innovative approach to ConvNet architecture. By combining different filter sizes and pooling layers
