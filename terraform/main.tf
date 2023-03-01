# We strongly recommend using the required_providers block to set the
# Azure Provider source and version being used
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-textmod-tf"
    storage_account_name = "textmodstorageacc"
    container_name       = "terraform-state"
    key                  = "terraform.tfstate"
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
  client_id       = var.client_id
  client_secret   = var.client_secret
}

resource "azurerm_resource_group" "rg-textmod-tf" {
  name     = "rg-textmod-tf"
  location = "northcentralus"
}

resource "azurerm_storage_account" "rg-textmod-tf" {
  name                      = "textmodstorageacc"
  resource_group_name       = azurerm_resource_group.rg-textmod-tf.name
  location                  = azurerm_resource_group.rg-textmod-tf.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true
}

resource "azurerm_storage_share" "rg-textmod-tf" {
  name                 = "textmod-data"
  storage_account_name = azurerm_storage_account.rg-textmod-tf.name
  quota                = 1
}

resource "azurerm_mysql_server" "rg-textmod-tf" {
  name                = "textmod-mysql-server"
  location            = azurerm_resource_group.rg-textmod-tf.location
  resource_group_name = azurerm_resource_group.rg-textmod-tf.name
  sku_name            = "B_Gen5_1"
  storage_mb          = 5120
  version             = "8.0"
  administrator_login =  var.mysql_admin
  administrator_login_password = var.mysql_admin_password
  ssl_enforcement_enabled = true

  tags = {
    environment = "dev"
  }
}

resource "azurerm_mysql_firewall_rule" "rg-textmod-tf" {
  name                = "allow-all"
  resource_group_name = azurerm_resource_group.rg-textmod-tf.name
  server_name         = azurerm_mysql_server.rg-textmod-tf.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "255.255.255.255"
}

output "mysql_server_fqdn" {
  value = azurerm_mysql_server.rg-textmod-tf.fqdn
}