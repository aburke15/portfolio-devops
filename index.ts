import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as azure from "@pulumi/azure-native";

/*
 * TODO: 1. create a mirroring resource group of current 'my-project-resources'
 * TODO: 2. create 1 azure storage resource
 * TODO: 3. try and add a table to the az storage called 'repos'
 * TODO: 4. create an azure static website
 * TODO: 5. try and pull the react portfolio and deploy it to step 4 resource
 * TODO: 6. create az web app
 * TODO: 7. try and deploy portfolio-be to the az web app
 */

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("my-project-resources-v2");

// Create an Azure resource (Storage Account)
const storageAccount = new storage.StorageAccount("ab15StorageV2", {
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
  kind: storage.Kind.StorageV2,
  location: resourceGroup.location,
});

const tableName = "repos";

const tableArgs: storage.TableArgs = {
  resourceGroupName: resourceGroup.name,
  accountName: storageAccount.name,
};

const repoTable = new azure.storage.Table(tableName, tableArgs);

// Export the primary key of the Storage Account
const storageAccountKeys = pulumi
  .all([resourceGroup.name, storageAccount.name])
  .apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName })
  );

export const primaryStorageKey = storageAccountKeys.keys[0].value;
