---
layout: post
title: "Deep Q-Learning (DQN)"
author: danghoangnhan
categories: [ deep-learning, reinforcement-learning ]
image: assets/images/dqn.jpeg
featured: false
hidden: false
description: "Why tabular Q-learning breaks down in continuous state spaces, and how DQN replaces the Q-table with a neural network and a replay buffer."
---

## Why DQN?

In an environment with a continuous state space it is impossible to visit every
state-action pair repeatedly: there are infinitely many of them, and the Q-table
would be unmanageably large.

DQN sidesteps this by approximating the Q-function with a neural network and
learning from previously stored experiences. The agent can therefore learn
repeatedly from episodes it has already lived without having to live them again,
which also avoids the cost of computing and updating a Q-table over a continuous
state space.

## Components

1. **Main neural network** — predicts the expected return of taking each action in
   a given state. Trained and updated every episode.
2. **Replay buffer** — a list filled with the experiences the agent has lived. An
   experience records the current state, the action taken in it, the reward
   obtained, whether it is a terminal state, and the next state reached.
3. **State size**
4. **Action size**
5. **Gamma** — the discount factor
6. **Episode**
7. **Number of steps**
8. **Epsilon value and epsilon decay**
9. **Learning rate**
10. **Target-network update rate**

## Source code

- [danghoangnhan/DQN](https://github.com/danghoangnhan/DQN)

## References

- [Deep Q-Learning walkthrough (YouTube)](https://www.youtube.com/watch?v=97gDXdA7kVc&t=232s)
- [Reinforcement Learning (DQN) Tutorial — PyTorch](https://pytorch.org/tutorials/intermediate/reinforcement_q_learning)
