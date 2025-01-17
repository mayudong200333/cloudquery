---
name: Render
stage: GA (Premium)
title: Render Source Plugin
description: CloudQuery Render source plugin documentation
---
# Render Source Plugin

:badge{text="Premium"}

This is a premium plugin that you can buy [here](/integrations/render).

The CloudQuery Render plugin extracts information from your [Render API](https://render.com/docs/api) and loads it into any supported CloudQuery destination (e.g. PostgreSQL, BigQuery, Snowflake, and [more](https://hub.cloudquery.io/plugins/destination)).

## Authentication

:authentication

## Configuration

:configuration

:::callout{type="info"}
Make sure you use environment variable expansion in production instead of committing the credentials to the configuration file directly.
:::

## Render Spec

This is the (nested) spec used by this plugin:

- `token` (string, required):
   
  This is the API token needed to authenticate with your account. More info available [here](https://api-docs.render.com/reference/authentication)
