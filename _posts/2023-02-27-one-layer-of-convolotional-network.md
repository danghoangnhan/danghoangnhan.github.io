---
layout: post
title: One Layer of a Convolutional Network

author: danghoangnhan
categories: [ DL,Convolutional Neural Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: true
---

## One Layer of a Convolutional Network

Get now ready to see how to build one layer of a convolutional neural network, let's go through an example.
Play video starting at  and follow 
You've seen at the previous video how to take a 3D volume and convolve it with say two different filters.
Play video starting at ::21 and follow 
In order to get in this example to different 4 by 4 outputs.
Play video starting at ::30 and follow transcript0:30
So let's say convolving with the first filter gives this first 4 by 4 output, and convolving with this second filter gives a different 4 by 4 output. The final thing to turn this into a convolutional neural net layer, is that for each of these we're going to add it bias, so this is going to be a real number. And where python broadcasting, you kind of have to add the same number so every one of these 16 elements. And then applyIn the last video, you saw
the building blocks of a single layer, of a single convolution
layer in the ConvNet. Now let's go through a concrete example
of a deep convolutional neural network. And this will give you some practice with
the notation that we introduced toward the end of the last video as well. Let's say you have an image, and you want to do image classification,
or image recognition. Where you want to take as input an image,
x, and decide is this a cat or not, 0 or 1, so it's a classification problem. Let's build an example of a ConvNet
you could use for this task. For the sake of this example,
I'm going to use a fairly small image. Let's say this image is 39 x 39 x 3. This choice just makes some of
the numbers work out a bit better. And so, nH in layer 0 will
be equal to nW height and width are equal to 39 and the number of channels and
layer 0 is equal to 3. Let's say the first layer
uses a set of 3 by 3 filters to detect features, so
f = 3 or really f1 = 3, because we're using a 3 by 3 process. And let's say we're using a stride of 1,
and no padding. So using a same convolution, and
let's say you have 10 filters. Then the activations in this next layer of the neutral network will be 37 x 37 x 10,
and this 10 comes from the fact
that you use 10 filters. And 37 comes from this formula n + 2p- f over s + 1. Right, then I guess you have 39 + 0- 3 over 1 + 1 that's = to 37. So that's why the output is 37 by 37,
it's a valid convolution and that's the output size. So in our notation you would
have nh[1] = nw[1] = 37 and nc[1] = 10, so nc[1] is also equal to the number of filters
from the first layer. And so this becomes the dimension of
the activation at the first layer. Let's say you now have another
convolutional layer and let's say this time you
use 5 by 5 filters. So, in our notation f[2] at
the next neural network = 5, and let's say use a stride of 2 this time. And maybe you have no padding and say, 20 filters. So then the output of this
will be another volume, this time it will be 17 x 17 x 20. Notice that,
because you're now using a stride of 2, the dimension has shrunk much faster. 37 x 37 has gone down in size by slightly
more than a factor of 2, to 17 x 17. And because you're using 20 filters,
the number of channels now is 20. So it's this activation a2 would be that dimension and so nh[2] = nw[2] = 17 and nc[2] = 20. All right,
let's apply one last convolutional layer. So let's say that you use
a 5 by 5 filter again, and again, a stride of 2. So if you do that, I'll skip the math,
but you end up with a 7 x 7, and let's say you use 40 filters,
no padding, 40 filters. You end up with 7 x 7 x 40. So now what you've done is
taken your 39 x 39 x 3 input image and computed your 7 x 7
x 40 features for this image. And then finally, what's commonly
done is if you take this 7 x 7 x 40, 7 times 7 times 40 is actually 1,960. And so what we can do is take
this volume and flatten it or unroll it into just 1,960 units, right? Just flatten it out into a vector, and then feed this to a logistic
regression unit, or a softmax unit. Depending on whether you're
trying to recognize cat or no cat or trying to recognize any one
of key different objects and then just have this give the final
predicted output for the neural network. So just be clear, this last step is
just taking all of these numbers, all 1,960 numbers, and
unrolling them into a very long vector. So then you just have one long vector that
you can feed into softmax until it's just a regression in order to make
prediction for the final output. So this would be a pretty
typical example of a ConvNet. A lot of the work in designing
convolutional neural net is selecting hyperparameters like these,
deciding what's the total size? What's the stride? What's the padding and
how many filters are used? And both later this week as well as next
week, we'll give some suggestions and some guidelines on how
to make these choices. But for now, maybe one thing to take
away from this is that as you go deeper in a neural network, typically you
start off with larger images, 39 by 39. And then the height and
width will stay the same for a while and gradually trend down as
you go deeper in the neural network. It's gone from 39 to 37 to 17 to 14. Excuse me,
it's gone from 39 to 37 to 17 to 7. Whereas the number of channels
will generally increase. It's gone from 3 to 10 to 20 to 40,
and you see this general trend in a lot of other convolutional
neural networks as well. So we'll get more guidelines about how to
design these parameters in later videos. But you've now seen your first example
of a convolutional neural network, or a ConvNet for short. So congratulations on that. And it turns out that
in a typical ConvNet, there are usually three types of layers. One is the convolutional layer, and
often we'll denote that as a Conv layer. And that's what we've been
using in the previous network. It turns out that there are two other
common types of layers that you haven't seen yet but we'll talk about
in the next couple of videos. One is called a pooling layer,
often I'll call this pool. And then the last is a fully
connected layer called FC. And although it's possible to design
a pretty good neural network using just convolutional layers, most neural network
architectures will also have a few pooling layers and a few fully connected layers. Fortunately pooling layers and fully connected layers are a bit simpler
than convolutional layers to define. So we'll do that quickly in the next
two videos and then you have a sense of all of the most common types of layers
in a convolutional neural network. And you will put together even more
powerful networks than the one we just saw. So congrats again on seeing your first
full convolutional neural network. We'll also talk later in this week
about how to train these networks, but first let's talk briefly about pooling and
fully connected layers. And then training these,
we'll be using back propagation, which you're already familiar with. But in the next video, let's quickly go
over how to implement a pooling layer for your ConvNet.convolutional neural network. So to map this back to one layer of four propagation in the standard neural network, in a non-convolutional neural network. Remember that one step before the prop was something like this, right? z1 = w1 times a0, a0 was also equal to x, and then plus b[1]. And you apply the non-linearity to get a[1], so that's g(z[1]). So this input here, in this analogy this is a[0], this is x3.
Play video starting at :2:44 and follow transcript2:44
And these filters here, this plays a role similar to w1. And you remember during the convolution operation, you were taking these 27 numbers, or really well, 27 times 2, because you have two filters. You're taking all of these numbers and multiplying them. So you're really computing a linear function to get this 4 x 4 matrix. So that 4 x 4 matrix, the output of the convolution operation, that plays a role similar to w1 times a0. That's really maybe the output of this 4 x 4 as well as that 4 x 4. And then the other thing you do is add the bias. So, this thing here before applying value, this plays a role similar to z. And then it's finally by applying the non-linearity, this kind of this I guess. So, this output plays a role, this really becomes your activation at the next layer. So this is how you go from a0 to a1, as far as tthe linear operation and then convolution has all these multipled. So the convolution is really applying a linear operation and you have the biases and the applied value operation. And you've gone from a 6 by 6 by 3, dimensional a0, through one layer of neural network to, I guess a 4 by 4 by 2 dimensional a(1). And so 6 by 6 by 3 has gone to 4 by 4 by 2, and so that is one layer of convolutional net.
Play video starting at :4:33 and follow transcript4:33
Now in this example we have two filters, so we had two features of you will, which is why we wound up with our output 4 by 4 by 2. But if for example we instead had 10 filters instead of 2, then we would have wound up with the 4 by 4 by 10 dimensional output volume. Because we'll be taking 10 of these naps not just two of them, and stacking them up to form a 4 by 4 by 10 output volume, and that's what a1 would be. So, to make sure you understand this, let's go through an exercise. Let's suppose you have 10 filters, not just two filters, that are 3 by 3 by 3 and 1 layer of a neural network, how many parameters does this layer have?
Play video starting at :5:21 and follow transcript5:21
Well, let's figure this out. Each filter, is a 3 x 3 x 3 volume, so 3 x 3 x 3, so each fill has 27 parameters, all right? There's 27 numbers to be run, and plus the bias.
Play video starting at :5:42 and follow transcript5:42
So that was the b parameter, so this gives you 28 parameters.
Play video starting at :5:50 and follow transcript5:50
And then if you imagine that on the previous slide we had drawn two filters, but now if you imagine that you actually have ten of these, right? 1, 2..., 10 of these, then all together you'll have 28 times 10, so that will be 280 parameters. Notice one nice thing about this, is that no matter how big the input image is, the input image could be 1,000 by 1,000 or 5,000 by 5,000, but the number of parameters you have still remains fixed as 280. And you can use these ten filters to detect features, vertical edges, horizontal edges maybe other features anywhere even in a very, very large image is just a very small number of parameters.
Play video starting at :6:40 and follow transcript6:40
So these is really one property of convolution neural network that makes less prone to overfitting then if you could. So once you've learned 10 feature detectors that work, you could apply this even to large images. And the number of parameters still is fixed and relatively small, as 280 in this example. All right, so to wrap up this video let's just summarize the notation we are going to use to describe one layer to describe a covolutional layer in a convolutional neural network. So layer l is a convolution layer, l am going to use f superscript,[l] to denote the filter size. So previously we've been seeing the filters are f by f, and now this superscript square bracket l just denotes that this is a filter size of f by f filter layer l. And as usual the superscript square bracket l is the notation we're using to refer to particular layer l.
Play video starting at :7:39 and follow transcript7:39
going to use p[l] to denote the amount of padding. And again, the amount of padding can also be specified just by saying that you want a valid convolution, which means no padding, or a same convolution which means you choose the padding. So that the output size has the same height and width as the input size.
Play video starting at :7:59 and follow transcript7:59
And then you're going to use s[l] to denote the stride.
Play video starting at :8:3 and follow transcript8:03
Now, the input to this layer is going to be some dimension. It's going be some n by n by number of channels in the previous layer. Now, I'm going to modify this notation a little bit. I'm going to us superscript l- 1, because that's the activation from the previous layer, l- 1 times nc of l- 1. And in the example so far, we've been just using images of the same height and width. That in case the height and width might differ, l am going to use superscript h and superscript w, to denote the height and width of the input of the previous layer, all right? So in layer l, the size of the volume will be nh by nw by nc with superscript squared bracket l. It's just in layer l, the input to this layer Is whatever you had for the previous layer, so that's why you have l- 1 there. And then this layer of the neural network will itself output the value. So that will be nh of l by nw of l, by nc of l, that will be the size of the output. And so whereas we approve this set that the output volume size or at least the height and weight is given by this formula, n + 2p- f over s + 1, and then take the full of that and round it down. In this new notation what we have is that the outputs value that's in layer l, is going to be the dimension from the previous layer, plus the padding we're using in this layer l, minus the filter size we're using this layer l and so on. And technically this is true for the height, right? So the height of the output volume is given by this, and you can compute it with this formula on the right, and the same is true for the width as well. So you cross out h and throw in w as well, then the same formula with either the height or the width plugged in for computing the height or width of the output value.
Play video starting at :10:36 and follow transcript10:36
So that's how nhl -1 relates to nhl and wl- 1 relates to nwl. Now, how about the number of channels, where did those numbers come from? Let's take a look, if the output volume has this depth, while we know from the previous examples that that's equal to the number of filters we have in that layer, right? So we had two filters, the output value was 4 by 4 by 2, was 2 dimensional. And if you had 10 filters and your upper volume was 4 by 4 by 10. So, this the number of channels in the output value, that's just the number of filters we're using in this layer of the neural network. Next, how about the size of this filter? Well, each filter is going to be fl by fl by 100 number, right? So what is this last number? Well, we saw that you needed to convolve a 6 by 6 by 3 image, with a 3 by 3 by 3 filter.
Play video starting at :11:43 and follow transcript11:43
And so the number of channels in your filter, must match the number of channels in your input, so this number should match that number, right? Which is why each filter is going to be f(l) by f(l) by nc(l-1). And the output of this layer often apply devices in non-linearity, is going to be the activations of this layer al. And that we've already seen will be this dimension, right? The al will be a 3D volume, that's nHl by nwl by ncl. And when you are using a vectorized implementation or batch gradient descent or mini batch gradient descent, then you actually outputs Al, which is a set of m activations, if you have m examples. So that would be M by nHl, by nwl by ncl right? If say you're using bash grading decent and in the programming sizes this will be ordering of the variables. And we have the index and the trailing examples first, and then these three variables. Next how about the weights or the parameters, or kind of the w parameter? Well we saw already what the filter dimension is. So the filters are going to be f[l] by f[l] by nc [l- 1], but that's the dimension of one filter. How many filters do we have? Well, this is a total number of filters, so the weights really all of the filters put together will have dimension given by this times the total number of filters, right? Because this, Last quantity is the number of filters, In layer l.
Play video starting at :13:45 and follow transcript13:45
And then finally, you have the bias parameters, and you have one bias parameter, one real number for each filter. So you're going to have, the bias will have this many variables, it's just a vector of this dimension. Although later on we'll see that the code will be more convenient represented as 1 by 1 by 1 by nc[l] four dimensional matrix, or four dimensional tensor.
Play video starting at :14:16 and follow transcript14:16
So I know that was a lot of notation, and this is the convention I'll use for the most part. I just want to mention in case you search online and look at open source code. There isn't a completely universal standard convention about the ordering of height, width, and channel. So If you look on source code on GitHub or these open source implementations, you'll find that some authors use this order instead, where you first put the channel first, and you sometimes see that ordering of the variables. And in fact in some common frameworks, actually in multiple common frameworks, there's actually a variable or a parameter. Why do you want to list the number of channels first, or list the number of channels last when indexing into these volumes. I think both of these conventions work okay, so long as you're consistent. And unfortunately maybe this is one piece of annotation where there isn't consensus in the deep learning literature but i'm going to use this convention for these videos.
Play video starting at :15:24 and follow transcript15:24
Where we list height and width and then the number of channels last. So I know there was certainly a lot of new notations you could use, but you're thinking wow, that's a long notation, how do I need to remember all of these? Don't worry about it, you don't need to remember all of this notation, and through this week's exercises you become more familiar with it at that time. But the key point I hope you take a way from this video, is just one layer of how convolutional neural network works. And the computations involved in taking the activations of one layer and mapping that to the activations of the next layer. And next, now that you know how one layer of the compositional neural network works, let's stack a bunch of these together to actually form a deeper compositional neural network. Let's go on to the next video to see,
