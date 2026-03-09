---
title: "ODP Real-Time Audiences: What Changed from Real-Time Segments and How I Implemented It"
description: "A practical guide to the Real-Time Segments to Real-Time Audiences shift in ODP, with a CMS implementation walkthrough."
pubDate: 2026-03-09
tags: ["Optimizely", "ODP", "Real-Time-Audiences", "Feature-Experimentation", "CMS"]
draft: false
---
## A small name change that is actually important

Some platform changes look cosmetic, but they are not. This is exactly how I see the move from **Real-Time Segments** to **Real-Time Audiences** in Optimizely Data Platform (ODP).

Some time ago I tried to implement the old Real-Time Segments in a project and it simply did not work the way it should. I spent too much time debugging behavior that felt inconsistent and hard to trust.

A while later, I came back to this topic - this time with **Real-Time Audiences**, it finally does what I expected. In this article, you will learn how to implement Real Time Audiences with OPD in your project built on Optimizely CMS.

## What changed: Segments vs Audiences

The biggest change is not only vocabulary, but operating model. In the old approach we mostly talked about segments as isolated targeting units, while now Optimizely frames this as audience-driven targeting across products.

In practice, you can still find "segment" in older docs, legacy integrations, and some UI paths, so both terms may appear side by side. The safe rule is simple: treat the current model as audience-first, and read legacy "segment" references as the older naming.

A Real-Time Audience is a dynamic group of customers evaluated from very recent behavior and profile signals, so membership can change quickly as users act. It is designed for near real-time personalization and experimentation decisions, instead of static, long-refresh historical grouping.

## How to implement this in the Optimizely CMS app

I wanted this to work directly in a CMS-based project with Visitor Groups, here is the setup.

## Step 1: Install Visitor Groups integration package

The integration package:

- `UNRVLD.ODP.VisitorGroups`
- Repo: <https://github.com/unrvld/ODP.VisitorGroups>

`UNRVLD.ODP.VisitorGroups` adds ODP-based audience criteria to CMS Visitor Groups, so your CMS personalization can evaluate whether a visitor belongs to selected ODP audiences.

Install:

```bash
dotnet add package UNRVLD.ODP.VisitorGroups
```

## Step 2: Register services in Startup

In `ConfigureServices`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddODPVisitorGroups();
}
```

That is enough to register the Visitor Group integration layer.

## Step 3: Configure ODP connection in appsettings.json

Example configuration:

```json
"EPiServer": {
  "OdpVisitorGroupOptions": {
    "OdpCookieName": "vuid",
    "OdpIdQueryField": "vuid",
    "CacheTimeoutSeconds": 10,
    "SchemaCacheTimeoutSeconds": 86400,
    "PopulationEstimateCacheTimeoutSeconds": 4320,
    "OdpEndpoints": [
      {
        "Name": "EU",
        "BaseEndPoint": "https://api.eu1.odp.optimizely.com",
        "PrivateApiKey": "ODP_AccessKey"
      }
    ]
  }
}
```

Two practical notes:

- Both `BaseEndPoint` and `PriavteApiKey` can be found in the ODP settings.
- Remember to never directly provide production keys in appsettings, use Secret for this purpose. 


## Step 4: Add ODP JavaScript Tag in the page header

Now we need to add the JavaScript Tag, which will ensure that our user's VUID will be linked to their actions in real time.

Because of that identity-to-behavior link, you get proper context for audience evaluation, and ODP can decide whether the user matches a given Real-Time Audience by combining live web actions with additional data/events you send from other sources (including backend events).

If you encounter difficulties during testing, find your test user in ODP and check its VUID in Identifiers. Additionally, ensure that the same VUID is present in your application—you can verify this by entering the following in the console:

```javascript
zaius.VUID
```

Get the script from the ODP portal under `Integrations -> JavaScript Tag`, and place it in the `<head>` section on tracked pages.

Implementation guide:
<https://docs.developers.optimizely.com/optimizely-data-platform/docs/implement-the-odp-javascript-tag>

## Step 5: Build and activate audiences

After the wiring is done:

1. Build Real-Time Audiences in ODP (`Customers -> Audiences`).
2. Use those audiences in CMS Visitor Groups.
3. Check if everything works!

## How to build a Real-Time Audience in ODP (UI flow)

The builder itself is straightforward:

1. Go to `Customers -> Audiences`.
2. Click `New Audience -> Real-Time Audience`.
3. Name the audience and create it.
4. Add `Attribute Conditions` and/or `Event Conditions`.
5. Build your logic with include/exclude and all/any operators.
6. Save the audience.

In practice, the most important part is condition design. The UI is simple, but a weak condition model gives weak targeting.

One extra detail worth remembering: real-time audience data latency is documented as under 90 seconds in general, with most requests much faster.

## What can go wrong (and usually does)

- Missing JS tag in `<head>`: no reliable real-time identity/event stream.
- Wrong endpoint or API key: Visitor Group criteria fail silently or return empty.
- Mismatched identifiers: `vuid` in one place, another ID in evaluation path.
- Wrong audience type: trying to solve real-time use cases with standard audiences.
- Overlapping audience logic: unexpected rule matches if boolean logic is not explicit.

## Real-Time Audience can also power your Experimentation!

Yes, you can use this directly in Feature Experimentation. In short: connect ODP with Experimentation, build/select the audience in ODP, and attach it to your flag rule targeting.

Short guide:

1. Open your flag in Feature Experimentation and go to targeting/rules.
2. Select the ODP audience as a targeting condition.
3. Save and test with a user that has matching `VUID` and audience data in ODP.

Official docs:

- <https://support.optimizely.com/hc/en-us/articles/38683417490957-Target-audiences-in-Feature-Experimentation>
- <https://support.optimizely.com/hc/en-us/articles/42410249910157-Build-Feature-Experimentation-audiences-in-ODP>

## Summary

For me, the move from Real-Time Segments to Real-Time Audiences is not just a rename. It is a cleaner operating model for targeting across the Optimizely ecosystem.

If you already run CMS + ODP + Experimentation, the setup above is a very practical baseline. Implement the package, configure endpoints properly, add the JavaScript tag, and then build audiences once and reuse them where they matter.

If you have questions, leave a comment and I can share a follow-up with a production-ready checklist.
