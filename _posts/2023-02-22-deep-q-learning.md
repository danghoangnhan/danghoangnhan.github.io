---
layout: post
title: Deep-Q-Learning
author: danghoangnhan
categories: [ DL,reinformencelearning ]
image: assets/images/dqn.png
featured: false
hidden: false
---

## Deep-Q-Learning(DQN)

### Why DQN?

- in an enviroment with a continue state space, it is impossible to go through all the possible states and actions repeatedly, since there are an infinite number of them and the Q-table would be too big.
- DQN solves this problem by approximating the Q-function thourgh a Neural Network and learning from the previous traning experiences, so that the agent can learn more times from experience already lived without the need to live them again, as well as avoiding the excesive computational cost calculating and updating the Q-table for continous state spaces.

### Component

 1. Main Neural network:
    The main NN tries to predict the expected return of taking each action for the given state.
    Train and update every episode.
 2. Replay Buffer:
    The replay buffer is a list that is filled with the experiences lived by the agent.
    An experience is represented by the current state, theaction taken in the current state, the reward obtaind after taking that action, whether is it a terminal state or not, and the next state reached after taking the action.
 3. State size
 4. Action size
 5. Gamme
 6. Episode
 7. Number of steps
 8. Epsilon value, epsilon decay
 9. Learning rate
 10. Target NN update rate
