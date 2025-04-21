---
layout: post
title: Leetcode-2140. Solving Questions With Brainpower
author: danghoangnhan
categories: [ leetcode ]
image: assets/images/leetcode/leetcode.png
featured: true
hidden: false
katex: True
---
# Leetcode-2140. Solving Questions With Brainpower

## Intuition

We need to split the binary string `s` into two non-empty parts—left and right—so that the score, defined as “number of zeros in the left part” plus “number of ones in the right part,” is maximized. If we can quickly determine, for any split position `i`:

- the count of zeros in `s[0…i]`, and
- the count of ones in `s[i+1…n−1]`,

then we can evaluate each possible split in constant time. A prefix‐sum array for zeros makes this efficient.

---

## Approach

1. **Build a prefix array of zero counts**  
   - Create `zeros[i]` = number of `'0'` characters in `s[0…i]`.  
   - This is done in a single pass:  

     ```cpp
     for (int i = 0; i < n; i++) {
         zeros[i] = (i > 0 ? zeros[i-1] : 0) + (s[i] == '0');
     }
     ```

2. **Enumerate every valid split**  
   - For split at index `i` (where `0 ≤ i < n−1`):  
     - **Left zeros** = `zeros[i]`.  
     - **Right length** = `n − i − 1`.  
     - **Right zeros** = `totalZeros − zeros[i]`, where `totalZeros = zeros[n−1]`.  
     - **Right ones** = `right length − right zeros`.  
     - **Score** = `zeros[i] + right ones`.  
   - Keep track of the maximum score.

3. **Return the maximum score** after checking all splits.

---

## Complexity

- **Time complexity:**  
  We make two linear passes over the string—one to build the prefix sums and one to evaluate splits—so the total is  
  $$O(n)\,.$$

- **Space complexity:**  
  We use an extra array of size `n` to store the prefix sums, so  
  $$O(n)\,.$$

---

## Code

```cpp
using namespace std;

class Solution {
public:
    int maxScore(string s) {
        int n = s.size();
        vector<int> zeros(n, 0);
        
        // 1. Build prefix-sum array for zeros
        for (int i = 0; i < n; i++) {
            zeros[i] = (i > 0 ? zeros[i-1] : 0) + (s[i] == '0');
        }
        
        int totalZeros = zeros[n-1];
        int result = 0;
        
        // 2. Enumerate all splits at i (left = s[0…i], right = s[i+1…n-1])
        for (int i = 0; i < n - 1; i++) {
            int leftZeros  = zeros[i];
            int rightLen   = n - i - 1;
            int rightZeros = totalZeros - zeros[i];
            int rightOnes  = rightLen - rightZeros;
            
            result = max(result, leftZeros + rightOnes);
        }
        
        return result;
    }
};
```

---

### Explanation

1. **Prefix-sum construction**  
   - We accumulate the count of `'0'` up to each index. This allows constant‑time retrieval of how many zeros appear in any prefix.

2. **Split evaluation**  
   - For each potential split before the last character, we compute:
     - `leftZeros` directly from the prefix sum.
     - `rightOnes` by subtracting the zeros in the right portion from its total length.
   - We then sum these to get the score for that split.

3. **Result**  
   - We track the maximum across all splits and return it. This transforms an otherwise quadratic‑time brute force into a linear‑time solution by leveraging prefix sums.
