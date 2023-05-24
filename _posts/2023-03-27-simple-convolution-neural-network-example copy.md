---
layout: post
title: Simple Convolutional Network Example
author: danghoangnhan
categories: [ DL,Convolutional-Neural-Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: false
---

# Convolutional Neural Networks: A Simple Example

Convolutional Neural Networks (ConvNets) are widely used for image classification and recognition tasks. In this blog post, we'll walk through a simple example of a ConvNet to understand its architecture and how it works.

Let's consider the task of classifying images as either cats or not cats. We'll work with a relatively small image size of 39 x 39 pixels with three color channels (RGB). In ConvNets, we process images through multiple layers, each designed to extract and learn different features.

The first layer of our ConvNet uses 3 x 3 filters to detect features in the image. With a stride of 1 and no padding, we apply 10 filters in this layer. The resulting activations form the input for the next layer, which will have dimensions of 37 x 37 x 10.

To compute the output size of a convolutional layer, we use the formula `n + 2p - f / s + 1`, where `n` is the input size, `p` is the padding, `f` is the filter size, and `s` is the stride. In our case, the image dimensions shrink to 37 x 37 due to the 3 x 3 filters.

Moving to the next layer, we apply 5 x 5 filters with a stride of 2 and no padding. Let's assume we use 20 filters in this layer. As a result, the output dimensions become 17 x 17 x 20, showing a faster reduction in size due to the larger stride.

Continuing further, we apply another layer with 5 x 5 filters and a stride of 2. Assuming no padding and using 40 filters, the output size becomes 7 x 7 x 40. At this point, we have transformed our initial image into a compact representation of 7 x 7 x 40 features.

To make predictions, we flatten this 7 x 7 x 40 volume into a vector of 1,960 units. This vector is then fed into a logistic regression or softmax unit, which produces the final classification output, determining whether the image contains a cat or not.

In designing ConvNets, careful selection of hyperparameters such as filter size, stride, padding, and the number of filters is crucial. These choices significantly impact the network's performance, and guidelines and recommendations are available to help make informed decisions.

It's important to note that as we go deeper into the ConvNet, the spatial dimensions (height and width) tend to decrease while the number of channels typically increases. This trend is observed in many convolutional neural network architectures.

ConvNets often include pooling layers and fully connected layers in addition to convolutional layers. Pooling layers reduce spatial dimensions, while fully connected layers provide the final classification output based on the extracted features.

In conclusion, Convolutional Neural Networks have revolutionized image classification and recognition tasks. Understanding their architecture and the role of different layers helps in designing effective models for various computer vision applications.

---

I hope you find this blog post summary helpful! Let me know if you have any further questions.
