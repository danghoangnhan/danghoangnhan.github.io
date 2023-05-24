---
layout: post
title: Inception Network

author: danghoangnhan
categories: [ DL,Convolutional-Neural-Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: true
---

## Inception Network

In a previous video, you've already seen all the basic
building blocks of the Inception network. In this video, let's see how you can
put these building blocks together to build your own Inception network. So the inception module takes
as input the activation or the output from some previous layer. So let's say for the sake of
argument this is 28 by 28 by 192, same as our previous video. The example we worked through in depth
was the 1 by 1 followed by 5 by 5 layer. So
maybe the 1 by 1 has 16 channels and then the 5 by 5 will output a 28 by 28 by,
let's say, 32 channels. And this is the example we worked through
on the last slide of the previous video. Then to save computation on your 3 by 3
convolution you can also do the same here. And then the 3 by 3 outputs,
28 by 28 by 1 by 28. And then maybe you want to consider
a 1 by 1 convolution as well. There's no need to do a 1 by 1 conv
followed by another 1 by 1 conv so there's just one step here and
let's say these outputs 28 by 28 by 64. And then finally is the pulling layer. So here I'm going to do something funny. In order to really concatenate
all of these outputs at the end we are going to use the same
type of padding for pooling. So that the output height and
width is still 28 by 28. So we can concatenate it
with these other outputs. But notice that if you do max-pooling,
even with same padding, 3 by 3 filter is tried at 1. The output here will be 28 by 28, By 192. It will have the same
number of channels and the same depth as
the input that we had here. So, this seems like is
has a lot of channels. So what we're going to do is
actually add one more 1 by 1 conv layer to then to what we saw in
the one by one convilational video, to strengthen the number of channels. So it gets us down to 28
by 28 by let's say, 32. And the way you do that,
is to use 32 filters, of dimension 1 by 1 by 192. So that's why the output dimension has
a number of channels shrunk down to 32. So then we don't end up
with the pulling layer taking up all the channels
in the final output. And finally you take all of these blocks
and you do channel concatenation. Just concatenate across
this 64 plus 128 plus 32 plus 32 and
this if you add it up this gives you a 28 by 28 by 256 dimension output. Concat is just this concatenating the
blocks that we saw in the previous video. So this is one inception module, and
what the inception network does, is, more or less,
put a lot of these modules together. Here's a picture of the inception network,
taken from the paper by Szegedy et al. And you notice a lot of
repeated blocks in this. Maybe this picture looks
really complicated. But if you look at one of the blocks
there, that block is basically the inception module that you
saw on the previous slide. And subject to little details I won't
discuss, this is another inception block. This is another inception block. There's some extra max pooling
layers here to change the dimension of the heightened width. But that's another inception block. And then there's another max put here
to change the height and width but basically there's another inception block. But the inception network is just a lot
of these blocks that you've learned about repeated to different
positions of the network. But so you understand the inception
block from the previous slide, then you understand the inception network. It turns out that there's one last detail
to the inception network if we read the optional research paper. Which is that there are these additional
side-branches that I just added. So what do they do? Well, the last few layers of
the network is a fully connected layer followed by a softmax layer
to try to make a prediction. What these side branches do is
it takes some hidden layer and it tries to use that to make a prediction. So this is actually a softmax output and
so is that. And this other side branch, again it is a hidden layer passes through
a few layers like a few connected layers. And then has the softmax try to
predict what's the output label. And you should think of this as maybe
just another detail of the inception that's worked. But what is does is it helps to
ensure that the features computed. Even in the heading units,
even at intermediate layers. That they're not too bad for
protecting the output cause of a image. And this appears to have a regularizing
effect on the inception network and helps prevent this
network from overfitting. And by the way,
this particular Inception network was developed by authors at Google. Who called it GoogleNet, spelled like
that, to pay homage to the network. That you learned about in
an earlier video as well. So I think it's actually really nice
that the Deep Learning Community is so collaborative. And that there's such
strong healthy respect for each other's' work in
the Deep Learning Learning community. FInally here's one fun fact. Where does the name
inception network come from? The inception paper actually cites
this meme for we need to go deeper. And this URL is an actual
reference in the inception paper, which links to this image. And if you've seen the movie
titled The Inception, maybe this meme will make sense to you. But the authors actually cite
this meme as motivation for needing to build deeper new networks. And that's how they came up with
the inception architecture. So I guess it's not often that research
papers get to cite Internet memes in their citations. But in this case,
I guess it worked out quite well. So to summarize,
if you understand the inception module, then you understand the inception network. Which is largely the inception
module repeated a bunch of times throughout the network. Since the development of the original
inception module, the author and others have built on it and
come up with other versions as well. So there are research papers on newer
versions of the inception algorithm. And you sometimes see people use
some of these later versions as well in their work, like inception v2,
inception v3, inception v4. There's also an inception version. This combined with the resonant
idea of having skipped connections, and that sometimes works even better. But all of these variations are built on
the basic idea that you learned about this in the previous video of coming
up with the inception module and then stacking up a bunch of them together. And with these videos you
should be able to read and understand, I think, the inception paper, as well as maybe some of the papers
describing the later derivation as well. So that's it, you've gone through quite a lot of
specialized neural network architectures. In the next video, I want to start showing
you some more practical advice on how you actually use these algorithms to build
your own computer vision system. Let's go on to the next video.