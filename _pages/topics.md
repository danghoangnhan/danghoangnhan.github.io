---
layout: page
title: Topics
permalink: /topics/
description: Every post on this blog, grouped by topic.
comments: false
---

<p class="lead">
  {{ site.categories | size }} topics across
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
