---
layout: page
title: Archive
permalink: /archive/
description: Every post on this blog, newest first.
comments: false
---

{%- assign visible = site.posts | where_exp: "p", "p.hidden != true" -%}

<p class="lead">{{ visible.size }} posts, newest first.</p>

{%- assign years = visible | group_by_exp: "p", "p.date | date: '%Y'" -%}
{%- for year in years %}

<section class="archive-year">
  <h2 id="y{{ year.name }}">{{ year.name }}</h2>
  <ul class="archive-list">
    {%- for post in year.items %}
    <li>
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d" }}</time>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="archive-meta">{% include reading-time.html content=post.content %}</span>
    </li>
    {%- endfor %}
  </ul>
</section>
{%- endfor %}
