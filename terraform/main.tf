provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variáveis (Deverão ser preenchidas no terraform.tfvars pelo usuário)
variable "project_id" {
  description = "ID do Projeto no Google Cloud"
  type        = string
}

variable "region" {
  description = "Região principal dos recursos"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona principal dos recursos"
  type        = string
  default     = "us-central1-a"
}

# 1. Criação da VPC Principal
resource "google_compute_network" "vpc_forca" {
  name                    = "vpc-forca"
  auto_create_subnetworks = false
}

# 2. Criação da Sub-rede Pública (Frontend)
resource "google_compute_subnetwork" "subnet_public" {
  name          = "subnet-public"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_forca.id
}

# 3. Criação da Sub-rede Privada (Backend e DB)
resource "google_compute_subnetwork" "subnet_private" {
  name          = "subnet-private"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.vpc_forca.id
}

# 4. Configurar Cloud Router e Cloud NAT para a Sub-rede Privada acessar a internet (para baixar pacotes/Docker sem ter IP Público)
resource "google_compute_router" "router" {
  name    = "router-forca"
  network = google_compute_network.vpc_forca.name
  region  = var.region
}

resource "google_compute_router_nat" "nat" {
  name                               = "nat-forca"
  router                             = google_compute_router.router.name
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.subnet_private.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
}
