import {locatePathSync} from 'locate-path';
import {ALL_PREMIUM_POLICIES, Policy} from "../components/policyData";
import fs from "fs";
import path from "path";

// Read the plugin data file
import {
    Plugin,
    ALL_SOURCE_PLUGINS, ALL_DESTINATION_PLUGINS, ALL_PLUGINS, PUBLISHED_SOURCE_PLUGINS, PUBLISHED_DESTINATION_PLUGINS
} from "../components/pluginData";

// Define the directories to write the MDX files to
const outputDir = "./integrations";
const mdxSourceComponentDir = "./components/mdx/plugins/source";
const mdxDestinationComponentDir = "./components/mdx/plugins/destination";


function getPolicyRedirectContent(policy: Policy, licenseType: string, licenseName: string) {
    return `---
title: Buy ${policy.name} (${licenseName})
---

import Head from "next/head";

<Head>
  <meta httpEquiv="refresh" content="5; url='${policy.buyLinks[licenseType]}'" />
</Head>

## Purchase ${policy.name} (${licenseName})

You will be redirected to a Stripe checkout page to complete your purchase in 5 seconds…

If the page does not redirect automatically, please click this link: [${policy.buyLinks[licenseType]}](${policy.buyLinks[licenseType]})
`;
}


function recreateDirectory(dir: string) {
    if (fs.existsSync(dir)) {
        // Clear the directory if it exists
        fs.rmSync(dir, { recursive: true, force: true });
        fs.mkdirSync(dir);
    } else {
        // Create the directory if it doesn't exist
        fs.mkdirSync(dir, { recursive: true });
    }
}


// Copy the source authentication file if it exists
function copySourceAuthenticationFile(source: Plugin) : boolean {
    // Copy the authentication file if it exists
    const authFilePath = locatePathSync([`./pages/docs/plugins/sources/${source.id}/_authentication.md`, `../plugins/source/${source.id}/docs/_authentication.md`]);
    if (authFilePath) {
        const ext = path.extname(authFilePath);
        const outputFilePath = path.join(mdxSourceComponentDir, `${source.id}/_authentication${ext}`);
        fs.copyFileSync(authFilePath, outputFilePath);
        return true;
    }
    return false;
}

// Copy the source configuration file if it exists and replace the destination name
function copySourceConfigurationFile(source: Plugin): boolean {
    const configFilePath = locatePathSync([`./pages/docs/plugins/sources/${source.id}/_configuration.md`, `../plugins/source/${source.id}/docs/_configuration.md`]);
    if (configFilePath) {
        ALL_DESTINATION_PLUGINS.forEach((destination) => {
            const sourceConfigDir = mdxSourceComponentDir + `/${source.id}/${destination.id}`;
            recreateDirectory(sourceConfigDir);
            let fileContents = fs.readFileSync(configFilePath, "utf8");
            fileContents = fileContents.replace(/DESTINATION_NAME/g, destination.id);
            const ext = path.extname(configFilePath);
            const outputFilePath = path.join(sourceConfigDir, `_configuration${ext}`);
            fs.writeFileSync(outputFilePath, fileContents);
        })
        return true;
    }
    return false;
}

// Copy the destination authentication file if it exists
function copyDestinationAuthenticationFile(destination: Plugin) : boolean {
    const authFilePath = locatePathSync([`./pages/docs/plugins/destinations/${destination.id}/_authentication.md`, `../plugins/destination/${destination.id}/docs/_authentication.md`]);
    if (authFilePath) {
        const ext = path.extname(authFilePath);
        const outputFilePath = path.join(mdxDestinationComponentDir, `${destination.id}/_authentication${ext}`);
        fs.copyFileSync(authFilePath, outputFilePath);
        return true;
    }
    return false;
}

// Copy the destination configuration file if it exists
function copyDestinationConfigurationFile(destination: Plugin) : boolean {
    const configFilePath = locatePathSync([`./pages/docs/plugins/destinations/${destination.id}/_configuration.md`, `../plugins/destination/${destination.id}/docs/_configuration.md`]);
    if (configFilePath) {
        const ext = path.extname(configFilePath);
        const outputFilePath = path.join(mdxDestinationComponentDir, `${destination.id}/_configuration${ext}`);
        fs.copyFileSync(configFilePath, outputFilePath);
        return true;
    }
    return false;
}


function createSourceIntegrationFile(source: Plugin) {
    // Define the file path for the new MDX file
    const filePath = path.join(outputDir, `${source.id}.mdx`);

    // Define the contents of the MDX file
    const fileContents = `---
title: ${source.name} Data Integration
---

<IntegrationSource source="${source.id}" />`;

    // Write the contents to the new file
    fs.writeFileSync(filePath, fileContents);
}

function createSourceDestinationIntegrationFile(source: Plugin, destination: Plugin, sourceHasAuth: boolean, destHasAuth: boolean) {
    // Define the file path for the new MDX file
    const filePath = path.join(
        outputDir,
        `${source.id}/${destination.id}.mdx`
    );

    const isOfficialSource = source.availability === "free";
    const isOfficialDestination = destination.availability === "free";

    // Define the contents of the MDX file
    const fileContents = `---
title: Export data from ${source.name} to ${destination.name}
---

<IntegrationDestination 
    source="${source.id}" 
    destination="${destination.id}" 
    isOfficialSource={${isOfficialSource}} 
    isOfficialDestination={${isOfficialDestination}}
    sourceHasAuth={${sourceHasAuth}}
    destHasAuth={${destHasAuth}}
/>`;

    // Write the contents to the new file
    fs.writeFileSync(filePath, fileContents);

    // Prepare the sync command file directory
    const syncCommandDir = mdxSourceComponentDir + `/${source.id}/${destination.id}`;
    if (!fs.existsSync(syncCommandDir)) {
        fs.mkdirSync(syncCommandDir, { recursive: true });
    }
    // Write the sync command file
    const syncCommandFilePath = path.join(syncCommandDir, "_sync.md");
    const sourceFilename = source.id === destination.id ? `source-${source.id}.yaml` : `${source.id}.yaml`;
    const destinationFilename = source.id === destination.id ? `destination-${destination.id}.yaml` : `${destination.id}.yaml`;
    const syncCommandFileContents = "```bash copy\n" +
        `cloudquery sync ${sourceFilename} ${destinationFilename}\n` +
        "```"
    // Write the contents to the new file
    fs.writeFileSync(syncCommandFilePath, syncCommandFileContents);
}

function generateFiles() {
    const sources = new Set<string>();
    const destinations = new Set<string>();

    let hasAuthFile = {};

    PUBLISHED_SOURCE_PLUGINS.forEach((source) => {
        if (source.availability === "premium") {
            return;
        }
        recreateDirectory(outputDir + "/" + source.id);
    });

    // Loop through each source plugin and generate or copy MDX files
    ALL_SOURCE_PLUGINS.filter((p) => p.availability !== 'premium' ).forEach((source) => {
      if (sources.has(source.id)) {
        throw new Error("Duplicate source id: " + source.id + ". Did you forget to remove an unpublished plugin you implemented?");
      }
      sources.add(source.id);

      const hasConfiguration = copySourceConfigurationFile(source);
      const isOfficial = source.availability === "free";
      if (isOfficial && !hasConfiguration) {
          throw new Error("No _configuration.md file found for source: " + source.id);
      }
      const hasAuthentication = copySourceAuthenticationFile(source);
      hasAuthFile['source-' + source.id] = hasAuthentication;
      createSourceIntegrationFile(source);
    });

    // Loop through each destination plugin and generate or copy MDX files
    ALL_DESTINATION_PLUGINS.forEach((destination) => {
        if (destination.availability === "premium") {
            return;
        }
        if (destinations.has(destination.id)) {
            throw new Error("Duplicate destination id: " + destination.id);
        }
        destinations.add(destination.id);
        recreateDirectory(mdxDestinationComponentDir + "/" + destination.id);

        const hasConfiguration = copyDestinationConfigurationFile(destination);
        const isOfficial = destination.availability === "free";
        if (isOfficial && !hasConfiguration && destination.id !== "more") {
            throw new Error("No _configuration.md file found for destination: " + destination.id);
        }
        const hasAuthentication = copyDestinationAuthenticationFile(destination);
        hasAuthFile['destination-' + destination.id] = hasAuthentication;
    });

    // Create the source -> destination integration files
    PUBLISHED_SOURCE_PLUGINS.forEach((source: Plugin) => {
        if (source.availability === "premium") {
            return;
        }
        PUBLISHED_DESTINATION_PLUGINS.forEach((destination: Plugin) => {
           if (destination.availability === "premium") {
             return;
           }
           const sourceHasAuth = hasAuthFile['source-' + source.id];
           const destHasAuth = hasAuthFile['destination-' + destination.id];
           createSourceDestinationIntegrationFile(source, destination, sourceHasAuth, destHasAuth);
       });
    });
}


generateFiles()

console.log("MDX files generated successfully!");