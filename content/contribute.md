---
title: Contributing to Statlib
intro: false
---

# Contributing to Statlib

Thank you for your interest in contributing to Statlib! Whether you are a statistician new to Lean, a Lean expert curious about statistics, or a CS / AI researcher interested in formalization tools, we are building with you. If anything in this document is unclear, please ask on the [Statlib Zulip channel](https://leanprover.zulipchat.com/#narrow/channel/611809-Statlib).

## Contents {#contents}

- [About Statlib](#about-statlib)
- [Relationship to Mathlib](#relationship-to-mathlib)
- [How to contribute](#how-to-contribute)
- [Submitting a pull request](#submitting-a-pull-request)
- [The role of AI](#the-role-of-ai)
- [Working with us across fields](#working-with-us-across-fields)
- [Style and documentation](#style-and-documentation)

## About Statlib {#about-statlib}

Statlib is, first, a **community**. Our goal is to develop the practices, shared vocabulary, and reusable infrastructure that let statisticians actually use Lean as a tool for research - to write in it, communicate through it, and verify their work with it.

We are a **research-driven** community. We target frontier topics through many kinds of contributions. Given that many probability-related results are missing from Mathlib and would be useful across a range of frontier directions in statistical research, we will also formalize the fundamentals of probability theory from the bottom up. The scope of Statlib is shaped by the interests of our maintainers, advisors, and active contributors.

**Statlib is not an autoformalization project.** Several projects of that kind already exist - typically one team using an LLM to translate a book or paper end-to-end. Statlib is different: its definitions and conventions are developed *together with* statisticians who use the language in their own research, with the aim of building a trusted core that future statistical research can use and rely on.

## Relationship to Mathlib {#relationship-to-mathlib}

Statlib depends on Mathlib. We do not duplicate Mathlib's `MeasureTheory` or `ProbabilityTheory`. Some of Statlib may live outside Mathlib until the project is mature and the code is reusable. Statlib's mission is to support specific statistical research topics.

- **We contribute back selectively.** When a definition or lemma developed in Statlib turns out to be general enough for Mathlib, we PR it upstream.
- **We do not aim to overwhelm Mathlib's review capacity.**
- **We will coordinate with Mathlib maintainers before large upstream pushes.** If a Statlib working group plans a substantial upstream contribution, we will discuss it on Zulip first.
- **We follow Mathlib's conventions for style, documentation, and AI use** by default, with extensions specific to our domain noted in this document.

## How to contribute {#how-to-contribute}

You are welcome to contribute in any way you see fit and have the most fun with.

- **Propose something.** Open a GitHub issue describing what you would like to add, and mention it in the [Statlib Zulip channel](https://leanprover.zulipchat.com/#narrow/channel/611809-Statlib). We will discuss scope and placement before you invest heavily in code.
- **Submit a pull request.** If you already have code you think fits Statlib, open a PR directly. See [Submitting a pull request](#submitting-a-pull-request) for what we expect.
- **Join an active working group.** Browse current projects on our website and the corresponding Zulip topics.
- **Discuss.** Join the [Statlib Zulip channel](https://leanprover.zulipchat.com/#narrow/channel/611809-Statlib); there are open questions you may be able to help with.
- **Propose a project.** We particularly welcome statisticians whose research vision could anchor a sustained working group, especially authors of widely used textbooks and lecture notes. Advising on definitions and levels of abstraction, reviewing what gets formalized, and catching when a Lean statement drifts from the source statistics are all highly desired contributions.

Project maintainers or leaders may use blueprints, GitHub project dashboards, or GitHub issues to maintain a project, claim or disclaim tasks, and coordinate through Zulip.

New to Lean? See the official [Lean installation instructions](https://lean-lang.org/install/).

## Submitting a pull request {#submitting-a-pull-request}

Most contributions come in as pull requests that add this kind of content to the library.

We ask that PRs:

- Be clear about the source: the book, paper, notes, or other reference your contribution is based on.
- Build on Mathlib and on existing Statlib working groups rather than duplicating definitions.
- Follow the conventions in [Style and documentation](#style-and-documentation).
- Be reviewable. Proofs should be readable, even when AI tools were used to produce them.

## The role of AI {#the-role-of-ai}

We believe agentic coding plays a substantial role in growing the library. We require transparency about that use and treat the resulting metadata as a research resource.

Our ultimate goal is not to be the first to formalize something. We believe digestion, explanation, and reusability matter more than generation. We therefore work to avoid PRs that create a `maintenance-burden` for the community, which we define as a PR meeting two or more of the following criteria:

- The author or authors are unable to answer reviewer questions about specific lines of code.
- The code is misaligned with the informal statement in the source.
- The PR description shows clear LLM authorship signals, such as formulaic Markdown structure or phrasing, and no human-written rationale paragraph is present.
- The proof is extremely long beyond reason and not readable.
- The PR introduces many new definitions without a corresponding ratio of theorems that meaningfully consume them.

Therefore, for any PR to Statlib, the contributor is expected to be able to honestly state:

*I have read and understood every line of code in this PR. I take responsibility for its correctness, style, and fit with the surrounding library. If a reviewer raises a question, I can answer it without re-running the AI tool.*

For background, see the Mathlib Zulip discussion [#mathlib4 > What to do with "slop" PRs](https://leanprover.zulipchat.com/#narrow/channel/287929-mathlib4/topic/What.20to.20do.20with.20.22slop.22.20PRs/with/576166954).

## Working with us across fields {#working-with-us-across-fields}

How best should we formalize statistics in Lean, and what does the future of research look like as formalization matures? We are an experimental library and welcome researchers from all areas to propose projects of many kinds: computer science projects, dataset-building efforts, automatic theorem-proving tools, and research on human-AI collaboration. This is a space to experiment with what research, education, and related work may look like in the future.

## Style and documentation {#style-and-documentation}

Statlib follows the [Mathlib style guide](https://leanprover-community.github.io/contribute/style.html) for layout, naming, and proof formatting.

We will add more guidelines for governance, todo lists, continuous integration, and tutorials soon.

If you spot anything in this document that should be improved - clarified, expanded, contradicted by experience, or just plain wrong - please open an issue or a PR. This document is itself a living artifact of the project.
