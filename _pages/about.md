---
layout: page
title: About me
description: "Daniel Du — AI software engineer in Taiwan, writing about computer vision, LLMs and data engineering. Résumé, contact and a playlist."
comments: true
permalink: /about
spotifyplaylist: 68DXxYTn25JzqqF9Xez4hV
---

<!--
  Rebuilt from hand-rolled floats onto the Bootstrap grid this site already loads.

  The two columns were `<div class="column" style="float: left; width: 50%">` with
  no media query anywhere, so they never stacked: on a 375px phone the bio was a
  ~170px-wide ribbon of text next to a 300px portrait that overflowed it. The
  wrapper also carried `style="content: ;"` (not a valid declaration) and
  `display: table` on a Bootstrap `.row`, which overrode the flex layout the class
  exists to provide.

  The avatar was a GIF hot-linked from emojis.slackmojis.com — a third-party host
  that CI never checks, because html-proofer runs with --disable-external — sitting
  inside the top-level heading with no alt text and looping forever. It is gone;
  the greeting is text.
-->

<div class="row align-items-center about-intro">
  <div class="col-md-7">
    <p>
      Hey, nice to see you. I’m Daniel — <span lang="zh-Hant">弘仁</span> in Chinese,
      or <span lang="vi">Nhân</span> in Vietnamese. Friends who know me as Vietnamese
      tend to use that one, and I like it.
    </p>
    <p>
      I grew up in a small village in Vietnam and now live in Taiwan, where I work as
      an AI software engineer.
    </p>
    <p>
      In my free time I travel and take photos wherever I end up, and I’m a full-time
      cat person. Both of those mostly end up on
      <a href="https://instagram.com/{{ site.instagram_username }}">Instagram</a>.
    </p>
  </div>
  <div class="col-md-5 text-center">
    <img
      class="about-portrait"
      src="{{ '/assets/images/logo.png' | relative_url }}"
      alt="Daniel Du"
      width="300"
      height="300"
      loading="lazy"
      decoding="async" />
  </div>
</div>

I spend a lot of my time on machine learning, data structures and algorithms. I’ve
worked as a software engineer and a DevOps engineer, and I post coding-related
material here as I go — mostly notes I wanted to exist while I was learning
something.

Have a look at [my repositories](https://github.com/{{ site.github_username }}) if
any of that sounds interesting; a star costs nothing and makes someone’s day.

## Résumé

Built from LaTeX source and rebuilt on every push, so this is always the current
version.

{% include resume.html %}

## Get in touch

Email is the best way to reach me — [{{ site.email }}](mailto:{{ site.email }}). I’m
always up for an interesting conversation or a collaboration.

<!--
  The heading above used to read "I'm best reached via email. I'm always open to
  interesting conversations and collaboration" — a full sentence marked up as a
  level-3 heading, and one that never gave the address it was pointing at.
-->

## What I’m listening to

{% include spotifyplaylist.html id=page.spotifyplaylist %}
