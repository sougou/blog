---
slug: welcome
title: Welcome to My Blog
authors: [sougou]
tags: [welcome, meta]
---

Welcome to my developer blog! This is a demonstration post showcasing the features of this Docusaurus-powered site.

<!--truncate-->

## About This Blog

This blog is built with [Docusaurus](https://docusaurus.io/), a modern static site generator optimized for technical content. It features:

- **Clean, minimalist design** - Focus on content, not clutter
- **Syntax highlighting** - Beautiful code blocks with language-specific highlighting
- **Tags and archive** - Easy navigation through posts
- **RSS/Atom feeds** - Subscribe to get updates
- **Dark mode** - Automatic theme switching based on system preferences
- **Fast performance** - Static site generation for instant page loads

## Code Examples

Here's an example of syntax highlighting in action:

```typescript
interface BlogPost {
  title: string;
  author: string;
  tags: string[];
  publishedAt: Date;
}

function publishPost(post: BlogPost): void {
  console.log(`Publishing: ${post.title}`);
  // Your publishing logic here
}
```

And here's a Python example:

```python
def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Generate first 10 Fibonacci numbers
fib_sequence = [fibonacci(i) for i in range(10)]
print(fib_sequence)
```

## Future Topics

I plan to write about:

- Software architecture and design patterns
- Performance optimization techniques
- Developer tools and workflows
- Open source contributions
- Technical deep dives

Stay tuned for more content!
