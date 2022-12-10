---
layout: page
title: Personal Project
---
{%- assign allposts =  site.projects | sort_natural: "date" | reverse %}

{%- assign postsByYearMonth = allposts | group_by_exp:"allposts", "allposts.date | date: '%Y %B'"  %}

<ul>
  {%- for post in site.projects %}
  <li><a href="{{ post.url }}">{{ post.date | date: "%b %Y" }} - {{ post.title }}</a></li>
  {%- endfor %}
</ul>