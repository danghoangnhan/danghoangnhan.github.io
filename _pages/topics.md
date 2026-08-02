---
layout: page
title: Topics
permalink: /topics/
description: Every post on this blog, grouped by topic.
comments: false
---

{%- comment -%}
  The headline count is computed the same way the cloud below is filtered, rather
  than from `site.categories | size`. That raw count includes categories whose
  only posts are hidden, so the page announced "10 topics" and then rendered 9 —
  `android` has exactly one post and it is unlisted.
{%- endcomment -%}
{%- assign shown_topics = 0 -%}
{%- for cat in site.categories -%}
  {%- assign v = cat[1] | where_exp: "p", "p.hidden != true" -%}
  {%- if v.size > 0 -%}{%- assign shown_topics = shown_topics | plus: 1 -%}{%- endif -%}
{%- endfor -%}

<p class="lead">
  {{ shown_topics }} topic{% unless shown_topics == 1 %}s{% endunless %} across
  {{ site.posts | where_exp: "p", "p.hidden != true" | size }} posts.
</p>

<ul class="topic-cloud">
  {%- assign cats = site.categories | sort -%}
  {%- for cat in cats -%}
    {%- assign visible = cat[1] | where_exp: "p", "p.hidden != true" -%}
    {%- if visible.size > 0 -%}
    <li>
      <a href="#{{ cat[0] | slugify }}">{{ cat[0] }} <span class="topic-count">{{ visible.size }}</span></a>
    </li>
    {%- endif -%}
  {%- endfor -%}
</ul>

{%- assign cats = site.categories | sort -%}
{%- for cat in cats -%}
  {%- assign visible = cat[1] | where_exp: "p", "p.hidden != true" | sort: "date" | reverse -%}
  {%- if visible.size > 0 %}

<section class="topic-section">
  <h2 id="{{ cat[0] | slugify }}">
    {{ cat[0] }}
    <a class="topic-permalink" href="{{ cat[0] | slugify | prepend: '/category/' | append: '/' | relative_url }}">all &rarr;</a>
  </h2>
  <ul class="topic-posts">
    {%- for post in visible %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="topic-meta">
        {{ post.date | date: "%b %Y" }} &middot; {% include reading-time.html content=post.content %}
      </span>
    </li>
    {%- endfor %}
  </ul>
</section>
  {%- endif -%}
{%- endfor %}
