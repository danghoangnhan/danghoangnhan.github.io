---
layout: post
title: MobileNe

author: danghoangnhan
categories: [ DL,Convolutional Neural Networks,vision ]
image: assets/images/cnn1.png
featured: false
hidden: true
---

## MobileNet

Hi and welcome back. You've learned about the
ResNet architecture, you've learned about
Inception net. In this video, you'll
learn about MobileNets, which is another foundational convolutional neural
network architecture used for computer vision. Using MobileNets will allow
you to build and deploy new networks that work even
in low compute environment, such as a mobile
phone. Let's dive in. Why do you need another
neural network architecture? It turns out in other neural networks
you've learned about so far are quite
computationally expensive. If you want your neural network
to run on a device with less powerful CPU or
a GPU at deployment, then there's another neural
network architecture called the MobileNet that could
perform much better. I hope to share a view
into this video how the depthwise separable
convolution works. Let's first revisit what the
normal convolution does, and then we'll modify it to build the depthwise
separable convolution. In the normal convolution, you may have an input image
that is some n by n by n_c, where n_c is the
number of channels. Six by six by three
channels in this case, and you want to convolve
it with a filter that is f by f by n_c, and in this case is
three by three by three. The way you do this
is you would take this filter which
I'm going to draw as a three-dimensional yellow block and put the yellow
filter over there. There are 27 multiplications
you have to do, sum it up, and then that
gives you this value. Then shift a filter over, multiply the 27 pairs of numbers, add that up that gives
you this number, and you keep going to get this, to get this, and then this, and so on, until you have computed all four by
four output values. We didn't use padding
in this case, and we use a stride of one, which is why the
output size a n out by a n out is a bit smaller
than the input size. That is this four by four
instead of six by six. Rather than just having one of these three by three
by three filters, you may have some
n_c prime filters and if you have five of them, then the output will be
four by four by five, or a n out by a n out by n_c prime. Let's figure out what is
the computational cost of what we just did. It turns out the total
number of computations needed to compute
this output is given by the number of filter
parameters which is three by three by
three in this case, multiplied by the number
of filter positions. That is a number
of places where we place this big yellow block, which is four by four, and then multiplied by
the number of filters, which is five in this case. You can check for
yourself that this is the total number of
multiplications we need to do, because at each of the locations we plopped
down the filter, we need to do this
many multiplications, and then we have
this many filters. If you multiply
these numbers out, this turns out to be
2,160. We'll come back. You see this number again
later in this video, when we come up with the depthwise
separable convolution that will be able
to take as input a six by six by three image
and outputs four by four by five set of activations that were fewer computations than 2,160. Let us see how the depthwise separable convolution does that. In contrast to the normal
convolution which you just saw, the depthwise separable
convolution has two steps. You're going to first use
a depthwise convolution, followed by a
pointwise convolution. It is these two steps
which together make up this depthwise
separable convolution. Let's see how each of
these two steps work. In particular, let's flesh out the details of how the
depthwise convolution, the first of these
two steps works. As before we have an input
that is six by six by three, so n by n by n_c, three channels. The filter and depthwise convolution is
going to be f by f, not f by f by n_c, but just f by f. The number of filters is going to be n_c, which in this case is three. The way that you will
compute the four by four by three output is that you apply one of each of these filters to one of each
of these input channels. Let's step through this. Let's focus on the first of the three filters,
just the red one. Then take the red filter
and position it there, carry out the nine
multiplications. Notice this, on nine
numbers means multiply, not 27, but nine,
and add them up. That will give you this value. Then shift it over, multiply the nine corresponding
pairs of numbers, that gives you this
value over here, gives you that, gives you that, and so on, until you get to
the last of these 16 values. Next, we go to the
second channel, and let's look at
the green filter. The green filter,
you position there, carry out the nine multiplications
to compute this value, shift it over by one
to compute this value, shift over by one, and so on. You do that 16 times until
you've computed all of these values in the second
channel of the outputs. Finally, you do this
for the third channel, there's a blue filter, position it there to compute
this value, shift it over, shift it over, shift
it over, and so on, until you've computed
all 16 outputs in that third channel as well. The size of the output
after this step will be n out by n out, four-by-four, by nc, where
nc is the same as this nc; the number of channels
in your original input. Let's look at the
computational cost of what we've just done. Because to generate each
of these output values, each of these 4 by 4
by 3 output values, it required nine multiplications. The total computational
cost is 3 by 3 times the number of
filter positions, that is, the number
of positions each of these filters was placed on
top of the image on the left. There was 4 by 4,
and then finally, times the number of
filters, which is 3. Another way to look
at this is that you have 4 by 4 by 3 outputs, and for each of those outputs, you needed to carry out
nine multiplications. The total computational
cost is 3 times 3 times 4 times 4 times 3. If you multiply
all these numbers, it turns out to be 432. But we're not yet done. This is a depth-wise
convolution part of the depth wise
separable convolution. There's one more step, which is, we need to take this 4 by
4 by 3 intermediate value and carry out one more step. The remaining step
is to take this 4 by 4 by 3 set of values, or n out by n out by nc set of values and apply a
pointwise convolution in order to get the output
we want which will be 4 by 4 by 5. Let's see how the pointwise
convolution works. Here's the pointwise convolution. We are going to take the
intermediate set of values, which is n out by n out by nc, and convolve it with a
filter that is 1 by 1 by nc, 1 by 1 by 3 in this case. Well, you take this pink filter, this pink 1 by 1 by 3 block, and apply it to upper
left-most position, carry out the three
multiplications, add them up, and that
gives you this value, shift it over by one, multiply the three pairs
of numbers, add them up, that gives you that
value, and so on. You keep going
until you've filled out all 16 values of this output. Now, we've done this
with just one filter in order to get another
4 by 4 output, by the 4 by 4 by 5
dimensional outputs, you would actually do this
with nc prime filters, in this case nc
prime will set to 5. So a five of these 1
by 1 by 3 filters, you end up with a 4 by 4
by 5 output as follows, to give you an n out by n out by nc prime
dimensional output. The pointwise convolution gives you the 4 by 4 by 5 output. Let's figure out the
computational cost of what we just did. For every one of these four by four by five output values, we had to apply this pink
filter to part of the input. That cost three operations
or 1 by 1 by 1, which is number of
filter parameters. The filtered had to be placed in 4 by 4 different positions, and we had five filters. To tell the cost of what
we just did here is, 1 times 1 times 3 times
4 times 4 times 5, which is 240 multiplications. In the example we just walked through, the normal convolution, took as input a six by
six by three input, and wound up with a four
by four by five outwards. Same for the depthwise
separable convolution, except we did it in two steps with a depthwise convolution, followed by a
pointwise convolution. Now, what were the
computational costs of all of these operations? In the case of the
normal convolution, we needed 2160 multiplications
to compute the output. For the depthwise
separable convolution, there was first,
the depthwise step, where we had from
earlier in the video, 432 multiplications and
then the pointwise step, where we had 240 multiplications, and so adding these up, we wind up with 672
multiplications. If we look the ratio
between these two numbers, 672 over 2160, this turns
out to be about 0.31. In this example, the depthwise
separable convolution was about 31 percent as computationally expensive as the normal convolution,
roughly [inaudible] savings. The authors of the
MobileNets paper showed that in general, the ratio of the cost of the depthwise
separable convolution compared to the
normal convolution, that turns out to be
equal to one over n_c prime plus one over f
squared in the general case. In our case, this was
one over five plus one over three squared or one
over nine, which is 0.31. In a more typical
neural network example, n_c prime will be much bigger. so It may be, say, one over 512. If you have 512 channels in your output plus one
over three squared, this would be a fairly typical
parameters or new network. This is really small
and this is one-ninth. So very roughly, the depthwise
separable convolution may be about one-ninth, rounding up roughly 10 times cheaper in
computational costs. That's why the depthwise
separable convolution as a building block of a convnet, allows you to carry
out inference much more efficiently than using
a normal convolution. Now, there's just one
more detail I want to share with you before
we wrap up this video. In the example that
we went through, the input here was
six by six by n_c, where n_c was equal
to three and thus you had three by three
by n_c filters here. Now, the depthwise
separable convolution works for any number of input channels. So if you had six input channels, then n_c would be
equal to six and you would also then have to have three by three by six filters. The intermediate outputs
will continue to be four by four by n_c, that becomes four by four by six. Now, something looks wrong
with this diagram, doesn't it? Which is that this
should be three by three by six not
three by three by three. But in order to make the diagrams in the next video look
a little bit simpler, even when the number of
channels is greater than three, I'm still going to draw the depthwise
convolution operation as if it was this stack
of three filters. When you see this
exact icon later, think of that as the icon we're using to denote a
depthwise convolution, rather than a very literal
exact visualization of the number of channels at the depthwise convolution filter. Going to use a similar icon to denote pointwise convolution. In this example, the
input here would be four by four by n_c, so it's really this
value from up here. Rather than expanding
the stack of values to be one by one by n_c, I'm going to continue to use this pink set of filters
that looks like that. Even if n_c is much larger, I'm still going to
draw it as if it looks like it only has
three filters to make some of the diagrams looks
simpler and this can give you the outputs of whatever's
necessary dimensions, such as four by four by eight, by some of the value of
n_c prime in this case. That's it. You've learned about the depthwise
separable convolution, which comprises two main steps, the depthwise convolution and
the pointwise convolution. This operation can be designed to have
the same inputs and output dimensions as the normal
convolutional operation, but it can be done in much
lower computational cost. Let's now take this
building block and use it to build the MobileNet, we'll do that in the next video.