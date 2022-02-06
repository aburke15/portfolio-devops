import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as azure from "@pulumi/azure-native";
import * as insights from "@pulumi/azure-native/insights";
import { RegistryArgs } from "@pulumi/azure-native/containerregistry";
import { TableArgs } from "@pulumi/azure-native/storage";
import { AppServicePlanArgs } from "@pulumi/azure-native/web";

/*
  TODO: create a resource group
  TODO: create a container registry in the resource group
  TODO: create a storage account in the resource group
  TODO: create an azure web app in the resource group
 */

// Create an Azure Resource Group
const rg = new resources.ResourceGroup("ab15-rg");

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("ab15storage", {
  resourceGroupName: rg.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
  kind: storage.Kind.StorageV2,
  location: rg.location,
});

const tableName = "repos";

const tableArgs: TableArgs = {
  resourceGroupName: rg.name,
  accountName: storageAccount.name,
};

new azure.storage.Table(tableName, tableArgs);

const registryArgs: RegistryArgs = {
  resourceGroupName: rg.name,
  adminUserEnabled: true,
  location: rg.location,
  registryName: "ab15registry",
  sku: {
    name: "Basic",
  },
};

const acr = new azure.containerregistry.Registry("ab15registry", registryArgs);

// Create an Azure Web App
const aspArgs: AppServicePlanArgs = {
  kind: "app",
  location: rg.location,
  name: "ASP-ab15azdemo",
  resourceGroupName: rg.name,
  sku: {
    name: "F1",
    tier: "Free",
  },
};

const asp = new azure.web.AppServicePlan("ASP-ab15azdemo", aspArgs);

const webAppArgs: azure.web.WebAppArgs = {
  resourceGroupName: rg.name,
  serverFarmId: asp.id,
  location: rg.location,
  httpsOnly: true,
  kind: "app",
  name: "ab15azdemo",
  redundancyMode: "None",
  siteConfig: {},
};

const webApp = new azure.web.WebApp("ab15azdemo", webAppArgs);

// Export the primary key of the Storage Account
const storageAccountKeys = pulumi
  .all([rg.name, storageAccount.name])
  .apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName })
  );

export const primaryStorageKey = storageAccountKeys.keys[0].value;
// export const webAppEndpoint = `https://${porfolioWebApp.defaultHostName}`;
