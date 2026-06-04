---
title: Roadmap — Statlib
description: Theorems and concepts queued for formalization, by topic.
intro: true
math: true
---

# Roadmap

We have curated a broad selection of core topics by reviewing foundational textbooks and leading journals in mathematical statistics, prioritizing the bedrock theories that have underpinned research over the last two decades. This list is intentionally non-exhaustive. Our goal is to systematically expand it to encompass modern research programs, such as high-dimensional statistics, random matrix theory, conformal inference, the theory of E-values, and computational-statistical trade-offs.

Furthermore, we recognize that much of contemporary and classical theoretical statistics relies fundamentally on empirical process theory and concentration inequalities. Given the immense depth of these fields, we have not yet charted specific results. Instead, we aim to populate these areas organically through community engagement, collaborating to discuss and prioritize our formalization efforts.

[[roadmap-toc]]

## Classical Cores (1920's-1990's) {#topic-i .topic}

### 1.1 Fundamentals of Decision Theory {#sec-1-1 .section}

#### Definitions

- **Decision Theoretic Setup**
- **Bayes risk**; **Minimax risk**
- **Admissible decision rules**
- **Complete** and **Essentially complete classes**
- **Invariant / equivariant decision rules under a group action**

#### Theorems / methods.

- **Wald's existence theorem**
- **Wald's complete-class theorem**
- **Pointwise characterization of Bayes rules**
- **Minimax-Bayes duality**
- **Stein's phenomenon**
- **James-Stein shrinkage estimation**
- **Hunt-Stein theorem**
- **Pitman estimators under location/scale invariance**
- **Sufficient Statistics, Factorization Theorem**
- **Complete Statistics, Ancillary Statistics, Basu's Theorem**
- **Sufficiency reduction and Rao-Blackwell / Lehmann-Scheffé UMVUE theory**

### 1.2 Comparison of Experiments {#sec-1-2 .section}

#### Definitions.

- **Statistical Experiment**
- **Markov-kernel / decision-rule formulation of an experiment**
- **Sufficiency of one experiment for another**
- **Le Cam's deficiency and Le Cam pseudo-distance**
- **Equivalent experiments**

#### Theorems/methods.

- **Blackwell's theorem**
- **Le Cam's randomization criterion**
- **Bayes-risk characterization of Le Cam's deficiency**
- **Convergence of experiments**
- **Asymptotic equivalence of experiments**

### 1.3 Local Asymptotic Theories {#sec-1-3 .section}

#### Definitions

- **Contiguity**
- **Local likelihood ratio process**
- **Quadratic Mean Differentiability (QMD), Score, and Fisher Information**
- **Local Asymptotic Normality (LAN)**
- **Local Asymptotic Mixed Normality (LAMN)**
- **Regular estimation**

#### Theorems/methods.

- **Le Cam's Lemmas**
- **QMD and LAN Expansion**
- **Hájek's convolution theorem**
- **Hájek's local asymptotic minimax theorem**
- **Properties of MLE and Asymptotic Efficiency**
- **Testing Efficiency: Pitman, Bahadur**

### 1.4 Semiparametric Efficiency Theories {#sec-1-4 .section}

#### Definitions.

- **Parametric Submodels and Tangent spaces**
- **Efficient score and Information**
- **Efficient influence function**
- **Functionals and Pathwise Differentiability**
- **Canonical gradient**
- **Asymptotically linear estimators**

#### Theorems/methods.

- **Nonparametric Information Bound and Local Asymptotic Minimaxity**
- **Nonparametric Convolution theorem**
- **Construction of Efficient estimators and Cross-Fitting**

### 1.5 Nonparametric Function Estimation Theories {#sec-1-5 .section}

#### Definitions/ objects.

- **Kernel Smoothing**
- **Histogram and partition-based estimators**
- **Series / Projection / orthogonal-series estimators**
- **Sieve estimators**
- **Local polynomial regression**
- **Stone's theorem on universal consistency**
- **Asymptotic Properties of Kernel Smoothing Estimators**
- **Asymptotic Theory of Cross-validation**
- **Pointwise vs. global rates**
- **Curse of dimensionality**
- **Stone's minimax-optimal rate theorem**

### 1.6 Minimax Lower Bound Methods {#sec-1-6 .section}

#### Definitions.

- **Reduction from estimation to testing**
- **Packing number, Covering number, Metric Entropy**

#### Theorems / methods.

- **Le Cam's two-point method**
- **Le Cam's convex-hull method**
- **Assouad's lemma**
- **Birgé's refinement of Assouad**
- **Fano's Lemma**
- **Yang-Barron metric-entropy method**

### 1.7 Ingster's Nonparametric Detection Theory {#sec-1-7 .section}

#### Definitions

- **Minimax Separation Rates**
- **Detection boundary**

#### Theorems/methods.

- **Minimax separation rate over Hölder / Sobolev / Besov classes**
- **Analysis of Chi-square-type test statistics**
- **Wavelet-based and quadratic-form tests**
- **Lower bound via two-point or mixture reduction**
- **Adaptive minimax tests**

### 1.8 Donoho-Johnstone Gaussian Sequence Model {#sec-1-8 .section}

#### Definitions

- **Gaussian sequence models**
- **Weak and Strong Sparsity classes**
- **Ellipsoids and Besov balls**
- **Soft- and hard-thresholding rules**
- **SureShrink, VisuShrink, block thresholding**

#### Theorems / methods.

- **Sharp Minimax risk over $\ell^p$-balls, Ellipsoids, and Pinsker's Theorem**
- **Simultaneous near-minimax over Besov balls and Donoho-Johnstone universal-threshold theorem**
- **Block thresholding and sharp minimax-optimal constants**
- **SURE risk estimator and SureShrink data-driven thresholding**
- **Maxiset theory**
- **Asymptotic equivalence to other nonparametric models**

### 1.9 Function Space Theories and Wavelets {#sec-1-9 .section}

#### Definitions.

- **Hölder spaces**, **Sobolev spaces**, **Besov spaces**, **Triebel-Lizorkin spaces**, **Nikolskii-Anisotropic Smoothness Spaces**
- **Modulus of continuity characterizations**
- **Orthonormal wavelet basis**
- **Multi-resolution analysis (MRA)**
- **Daubechies compactly-supported wavelets**

#### Theorems / methods.

- **Wavelet characterization of Function Spaces**
- **Wavelet Basis Approximation theorems**
- **Jackson and Bernstein inequalities**
- **Embeddings of Function spaces**

### 1.10 Functional Estimation Theories {#sec-1-10 .section}

#### Definitions

- **Donoho-Liu "geometrizing rates"**

#### Theorems / methods.

- **Birgé-Massart oracle inequality for penalized model-selection estimators**
- **Lepski's method and Adaptive minimax rates**
- **Donoho-Liu rates for quadratic functionals**
- **Elbow Effect for Functional Estimation**
- **Modulus-of-continuity / hardest-one-dimensional-subproblems**
- **General Nonlinear Integrated functional Estimation**
- **Higher Order Influence Functions**

### 1.11 Fundamentals of Bayesian Statistics {#sec-1-11 .section}

#### Definitions

- **Prior on Space of Probability measures**
- **RCP, Posterior distribution and marginal likelihood**
- **Bayes' theorem**
- **Conjugate families of priors**
- **Improper priors and conditions for proper posteriors**
- **Posterior predictive distribution**
- **Bayes factor**
- **Credible intervals / sets**
- **Exchangeable sequences**

#### Theorems / methods.

- **de Finetti's theorem**
- **Hewitt-Savage zero-one law for exchangeable events**
- **Doob's consistency theorem**
- **Schwartz's theorem**
- **Bernstein-von Mises theorems**
- **Diaconis-Freedman inconsistency counterexamples**
- **Lindley's paradox**
- **Robbins' empirical Bayes / compound decision theory**
- **Stein's empirical-Bayes interpretation of the James-Stein estimator**

### 1.12 Causal Identification Theories {#sec-1-12 .section}

#### Definitions

- **Potential outcomes and counterfactuals**
- **Stable Unit Treatment Value Assumption (SUTVA)**
- **Causal estimands**
- **Causal Bayesian network / causal DAG**
- **Structural Causal Model (SCM)**
- **Intervention / do-operator**
- **Interventional distribution**
- **d-separation**
- **Confounding / unmeasured confounding**
- **Back-door path**, **front-door path**, **collider**, **chain**, **fork**
- **Adjustment sets**
- **Propensity score**
- **Instrumental variables (IV)**
- **Compliance types**
- **Time-varying treatments and Confounder**
- **Sequential exchangeability**
- **Marginal Structural Model (MSM)**
- **Structural Nested Mean Model (SNMM) / Structural Nested Model (SNM)**
- **Mediation effects**
- **Partial identification**

#### Theorems / methods.

- **Verma-Pearl d-separation theorem**
- **Markov factorization theorem**
- **Back-door criterion**
- **Adjustment formula**
- **Front-door criterion**
- **Do-calculus, soundness theorem**
- **Shpitser-Pearl completeness theorem**
- **ID algorithm**
- **Robins' g-formula**
- **G-computation algorithm**
- **Identification of dynamic treatment regimes**
- **Marginal Structural Model identification**
- **Structural Nested Mean Model identification**
- **Doubly robust identification / estimation**
- **Rosenbaum-Rubin theorem**
- **LATE theorems**
- **Manski bounds**
- **Verma constraints**
- **Mediation identifications**

### 1.13 Core Probabilistic Toolbox {#sec-1-13 .section}

- **Empirical Process Theory**
- **Concentration Inequalities**
