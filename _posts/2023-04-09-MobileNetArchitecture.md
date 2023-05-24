---
layout: post
title: MobileNet Architecture


author: danghoangnhan
categories: [ DL,Convolutional Neural Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: true
---

## MobileNet Architecture


Welcome back, in
the last video you learned about the depth-wise
separable convolution. Let's now put this
into a neural network in order to build the MobileNet. The idea of MobileNet
is everywhere that you previously have used an expensive
convolutional operation. You can now instead use a much less expensive depthwise separable
convolutional operation, comprising the depthwise
convolution operation and the pointwise
convolution operation. The MobileNet v1 paper had
a specific architecture in which it use a block
like this, 13 times. It would use a depthwise
convolutional operation to genuine outputs and
then have a stack of 13 of these layers in order to go from the original raw input image to finally making a
classification prediction. Just to provide a few more
details after these 13 layers, the neural networks
last few layers are the usual Pooling layer, followed by a fully
connected layer, followed by a Softmax in order for it to make a
classification prediction. This turns out to perform well while being much
less computationally expensive than earlier algorithms that used a normal
convolutional operation. In this video, I want
to share with you one more improvements on this basic MobileNet
architecture, which is the MobileNets
v2 architecture. I'm going to go through this quite quickly to just give you a rough sense of
what the algorithm does without digging
into all of the details. But this is a paper published
by Mark Sandler and his colleagues that make
mobile network even better. In MobileNet v2, there
are two main changes. One is the addition of
a residual connection. This is just a residual
connections that you learned about in
the ResNet videos. This residual connection
or skip connection, takes the input from
the previous layer and sums it or passes it
directly to the next layer, does allow ingredients to propagate backward
more efficiently. The second change is that it
also as an expansion layer, which you learn more
about on the next slide, before the depthwise convolution, followed by the
pointwise convolution, which we're going to call projection in a
point-wise convolution. Is really the same operation, but we'll give it
a different name, for reasons that you
see on the next slide. What MobileNet v2 does, is it uses this block and repeats this block
some number of times, just like we had 13 times here, the MobileNet v2
architecture happened to choose to do this 17 times, surpass the inputs through
17 of these blocks, and then finally ends up with the usual pooling
fully-connected softmax, in order to make a
classification prediction. But the key idea is really
how blocks like this, or like this reduces
computational cost. This block over here is also
called the bottleneck block. Let's dig into the details of how the MobileNet v2 block works. Given an input that is say, n by n by three, the MobileNet v2
bottleneck will pass that input via the
residual connection directly to the output, just like in the Resnet. Then in this main non-residual connection
parts of the block, you'll first apply an
expansion operator, and what that means
is you'll apply a 1 by 1 by n c. In this case, one by one by
three-dimensional filter. But you apply a fairly
large number of them, say 18 filters, so that you end up with an n by n by 18-dimensional
block over here. A factor of expansion of six is quite typical in
MobileNet v2 which is why your inputs goes from n by n by three to n by n by 18, and that's why we call
it an expansion as well, it increases the dimension
of this by a factor of six, the next step is then a
depthwise separable convolution. With a little bit of padding, you can then go from n by n
by 18 to the same dimension. In the last video, we
went from 6 by 6 by 3 to 4 by 4 by 3 because
we didn't use padding. But with padding, you
can maintain the n by n by 18 dimension, so it doesn't shrink when you apply the depthwise convolution. Finally, you apply a
pointwise convolution, which in this case means
convolving with a 1 by 1 by 18-dimensional filter. If you have, say, three filters and
c prime filters, then you end up with
an output that is n by n by 3 because you have
three such filters. In this last step, we went from n by n by 18
down to n by n by three, and in the MobileNet
v2 bottleneck block. This last step is also
called a projection step because you're
projecting down from n by n by 18 down to n by n by 3. You might be wondering, why do we meet these bottleneck blocks? It turns out that
the bottleneck block accomplishes two things, One, by using the expansion operation, it increases the size of the representation within
the bottleneck block. This allows the neural network to learn a richer function. There's just more
computation over here. But when deploying
on a mobile device, on edge device, you will often be heavy
memory constraints. The bottleneck block uses
the pointwise convolution or the projection operation in
order to project it back down to a smaller set of values, so that when you pass
this the next block, the amount of memory needed to store these values is
reduced back down. The clever idea, The
cool thing about the bottleneck block is that it enables a richer set
of computations, thus allow your neural
network to learn richer and more
complex functions, while also keeping the amounts
of memory that is the size of the activations
you need to pass from layer to layer, relatively small. That's why the
MobileNet v2 can get a better performance
than MobileNet v1, while still continuing to use only a modest amount of
compute and memory resources. Putting It all together again, here's our earliest slide
describing MobileNet v1 and v2. The MobileNet v2
architecture will repeat this bottleneck
block 17 times. Then if your goal is to
make a classification, then as usual will have this pooling fully-connected
softmax layer to generate the
classification output. You now know the main ideas
of MobileNet v1 and v2. If you want to see a few
additional details such as the exact dimensions of
the different layers as you flow the data
from left to right. You can also take a look at the paper by Mark Sandler
and others as well. Congrats on making it to
the end of this video, you now know how MobileNet
v1 and v2 work by using depthwise separable
convolutions and by using the bottleneck blocks
that you saw in this video. If you are thinking of building efficient
neural networks, there's one other idea
to found very useful, and I hope you will
learn about as well, which is efficient nets. Let's touch on that idea very
briefly in the next video.