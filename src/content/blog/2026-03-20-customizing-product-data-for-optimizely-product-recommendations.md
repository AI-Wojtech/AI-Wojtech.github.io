---
title: "Customizing Product Data Sent to Optimizely Product Recommendations in Optimizely Commerce"
description: "A practical guide to customizing IEntryAttributeService in Optimizely Commerce so you can override product titles, add custom feed attributes, and keep safe fallbacks to the default behavior."
pubDate: 2026-03-20
tags: ["Optimizely", "Optimizely Commerce", "Product Recommendations", "Personalization", "C#", "Architecture"]
draft: false
---

## Why I touched this at all

When working with Optimizely Product Recommendations, I usually start by checking what product data is actually being sent to the feed.

In many projects, the default export is a good starting point. But sometimes "good enough" is not really enough. Maybe the title should come from a better field. Maybe you want to add stock-related data, image presence, or a lightweight brand identifier. The good news is that you do not always need to replace the whole mechanism. In practice, you can often extend the default behavior instead of rebuilding it from scratch.

In this article I will show a practical way to do that: replace `IEntryAttributeService` with your own implementation, reuse the default service where it still makes sense, and change only the parts you actually care about.

## The problem: default feed data is sometimes too generic

Optimizely Product Recommendations depends on product feed data to understand your catalog. That usually includes fields like title, description, recommendation eligibility, and a collection of exported attributes.

The default implementation is useful because it gives you a baseline quickly. Still, I have seen a few recurring cases where teams want more control:

- The exported title is not the one you want to use from Commerce.
- Sometimes you want to export attributes derived from more complex business logic.
- You want better control over fallback values for selected fields.
- You only need a targeted customization, not a full replacement of the default service.

This is where `IEntryAttributeService` becomes interesting.

## What `IEntryAttributeService` actually does

The `EPiServer.Personalization.Commerce.CatalogFeed.IEntryAttributeService` interface is one of the extension points that influences how a Commerce entry is translated into data used by Product Recommendations.

```csharp
using System.Collections.Generic;
using EPiServer.Commerce.Catalog.ContentTypes;

namespace EPiServer.Personalization.Commerce.CatalogFeed;

public interface IEntryAttributeService
{
    IDictionary<string, string> GetAttributes(EntryContentBase entryContent, string scope);
    string GetDescription(EntryContentBase entryContent, string scope);
    string GetTitle(EntryContentBase entryContent, string scope);
    bool CanBeRecommended(EntryContentBase entryContent, decimal stock, string scope);
}
```

The interesting part is not only what these methods return, but when to change them and when not to.

- `GetTitle(...)` lets you shape the name that represents the product in the exported feed.
- `GetAttributes(...)` gives you a place to enrich the feed with extra catalog signals.

For this kind of integration, I usually prefer changing only the parts I actually need and leaving the rest on the default behavior.

## How I customize the default implementation

The practical approach is simple: I register my own `CustomEntryAttributeService` as `IEntryAttributeService`, inject the default implementation into it, and then decide method by method what should stay as-is and what should change.

This gives me two useful things at the same time:

- I can change exported data in a very focused way.
- I do not have to rebuild the whole service from zero.

Here is a simplified example of the custom service:

```csharp
using System.Collections.Generic;
using System.Linq;
using EPiServer.Commerce.Catalog.ContentTypes;
using EPiServer.Personalization.Commerce.CatalogFeed;

public class CustomEntryAttributeService : IEntryAttributeService
{
    private readonly IEntryAttributeService _defaultEntryAttributeService;

    public CustomEntryAttributeService(IEntryAttributeService defaultEntryAttributeService)
    {
        _defaultEntryAttributeService = defaultEntryAttributeService;
    }

    public string GetTitle(EntryContentBase entryContent, string scope)
    {
        // Example: prefer display-oriented values first, then fall back to catalog-safe identifiers.
        return new[] { entryContent.DisplayName, entryContent.Name, entryContent.Code }
            .FirstOrDefault(static value => !string.IsNullOrWhiteSpace(value))
            ?? "Unnamed product";
    }

    public IDictionary<string, string> GetAttributes(EntryContentBase entryContent, string scope)
    {
        var attributes = _defaultEntryAttributeService.GetAttributes(entryContent, scope);

        attributes.Add("AvailabilityLabel", "Available");
        attributes.Add("ImageState", "ReadyForDisplay");
        attributes.Add("RecommendationGroup", "PriorityCatalog");
        // Your custom implementation can calculate these values using your own business logic.

        return attributes;
    }

    public string GetDescription(EntryContentBase entryContent, string scope)
        => _defaultEntryAttributeService.GetDescription(entryContent, scope);

    public bool CanBeRecommended(EntryContentBase entryContent, decimal stock, string scope)
        => _defaultEntryAttributeService.CanBeRecommended(entryContent, stock, scope);
}
```

That is the core idea. Two methods are customized, two are delegated unchanged.

## Example: overriding `GetTitle(...)`

The title is often the first thing I want to control. In some catalogs, `DisplayName` is the cleanest value for recommendations. In others, `Name` is more reliable. And yes, sometimes the safest fallback is simply `Code`.

I usually keep the rule predictable:

1. Use `DisplayName` if available.
2. Otherwise use `Name`.
3. Otherwise fall back to `Code`.

```csharp
public string GetTitle(EntryContentBase entryContent, string scope)
{
    // Example: prefer display-oriented values first, then fall back to catalog-safe identifiers.
    return new[] { entryContent.DisplayName, entryContent.Name, entryContent.Code }
        .FirstOrDefault(static value => !string.IsNullOrWhiteSpace(value))
        ?? "Unnamed product";
}
```

Why does this help? Because recommendation data becomes more predictable. If `DisplayName` is the field you actually want to expose from Commerce, this approach gives you a simple and safe fallback to `Name` and then `Code`.

## Example: adding custom attributes in `GetAttributes(...)`

This is the more flexible part. Instead of replacing the full attribute map, I prefer to start from the default attributes and then extend them with a few extra values that matter for the catalog.

```csharp
public IDictionary<string, string> GetAttributes(EntryContentBase entryContent, string scope)
{
    var attributes = _defaultEntryAttributeService.GetAttributes(entryContent, scope);

    attributes.Add("AvailabilityLabel", "Available");
    attributes.Add("ImageState", "ReadyForDisplay");
    attributes.Add("RecommendationGroup", "PriorityCatalog");
    // Your custom implementation can calculate these values using your own business logic.

    return attributes;
}
```

*This example is intentionally simple and only shows how you can add new attributes. How you obtain or calculate them depends on your individual situation and business needs.*

The interesting part is that these do not have to be direct fields from your product or variant definition. In many implementations, the useful attributes are computed in code from your own business rules and then appended to the exported feed. This gives you much more freedom in controlling what should be recommended, because those calculated values can be based on logic that is far more complex than a single catalog field.

There are a few small but important details here:

- I start from the default attribute set instead of rebuilding everything from zero.
- I add only the extra fields that I want to send to the feed.
- I keep attribute names stable and explicit: `AvailabilityLabel`, `ImageState`, `RecommendationGroup`.

In practice, this gives you a clean place to enrich the feed with signals derived from your own business logic. Those signals can later help you shape recommendation behavior for your specific use case more precisely.

## Leaving `GetDescription(...)` and `CanBeRecommended(...)` on default behavior

One of the strengths of this approach is that you do not need to override every method just because the interface offers it.

If your current description export is fine, keep it:

```csharp
public string GetDescription(EntryContentBase entryContent, string scope)
    => _defaultEntryAttributeService.GetDescription(entryContent, scope);
```

If recommendation eligibility already matches what you need, keep that too:

```csharp
public bool CanBeRecommended(EntryContentBase entryContent, decimal stock, string scope)
    => _defaultEntryAttributeService.CanBeRecommended(entryContent, stock, scope);
```

This is not laziness. This is ownership with boundaries. I only want to own custom logic where I have a clear reason.

## Registration in the DI container

The registration part depends on the container you use, but the idea stays the same: register your `CustomEntryAttributeService` as the final `IEntryAttributeService`, while still passing the default implementation into its constructor.

If your container supports service interception, the registration can look like this:

```csharp
services.Intercept<IEntryAttributeService>((serviceProvider, defaultService) =>
    new CustomEntryAttributeService(defaultService));
```

That is usually enough. The container gives you the default implementation, and you replace the final registration with your custom one.

## Summary

If you want more control over the product data sent from Optimizely Commerce to Optimizely Product Recommendations, `IEntryAttributeService` is a very practical place to start.

It lets you improve title selection, add focused custom attributes, and still keep the default behavior for everything that already works well. For me, that is the sweet spot: improve the feed quality without turning a small customization into an unnecessary rewrite.

This pattern makes the most sense when you want to enrich or normalize the catalog data going into the recommendation engine, but you do not want to own the entire export pipeline. If that sounds familiar, this is probably the first extension point I would reach for.

If you have any questions or interesting cases to consider in your own application, let me know and we can try to find a solution tailored to your needs.

Regards,
Wojtek
