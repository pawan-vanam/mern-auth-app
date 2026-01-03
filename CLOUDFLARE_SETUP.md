# Cloudflare Integration Guide for MERN Stack on VPS

This guide will help you set up Cloudflare for your application (`mern-auth-app`) currently hosted on a VPS. Cloudflare provides security (DDoS protection), performance (CDN), and free SSL.

## Phase 1: Cloudflare Account Setup

1. **Sign Up/Login**: Go to [Cloudflare.com](https://www.cloudflare.com/) and create an account.
2. **Add Site**:
   - Click **"Add a Site"**.
   - Enter your domain name (e.g., `yourdomain.com`).
   - Select the **Free Plan** (at the bottom) and click Continue.
3. **DNS Scan**: Cloudflare will scan your existing DNS records.
   - Ensure there is an `A` record for your root domain (`@`) pointing to your **VPS IP Address**.
   - Ensure there is a `CNAME` or `A` record for `www` and `api` if you use subdomains.
   - Make sure the **Proxy Status** switch is **Orange (Proxied)** for your domain and `www`.
4. **Nameservers**:
   - Cloudflare will provide two nameservers (e.g., `bob.ns.cloudflare.com`, `alice.ns.cloudflare.com`).
   - Copy these.

## Phase 2: Domain Registrar Configuration

1. Log in to where you bought your domain (Godaddy, Hostinger, Namecheap, etc.).
2. Find the **DNS** or **Nameservers** settings for your domain.
3. Select **"Custom Nameservers"**.
4. Replace the existing nameservers with the two Cloudflare nameservers.
5. Save. _Note: This can take anywhere from a few minutes to 24 hours to propagate._

## Phase 3: VPS Configuration (Nginx)

**Critical for getting Real User IPs**: By default, your server will see all traffic coming from Cloudflare IPs. You need to configure Nginx to restore the original visitor IP.

1. **SSH into your VPS**:
   ```bash
   ssh root@your_vps_ip
   ```
2. **Create a Cloudflare Config for Nginx**:
   Create a file to list Cloudflare IPs:

   ```bash
   nano /etc/nginx/conf.d/cloudflare.conf
   ```

   Paste the following (these are Cloudflare's IP ranges):

   ```nginx
   set_real_ip_from 103.21.244.0/22;
   set_real_ip_from 103.22.200.0/22;
   set_real_ip_from 103.31.4.0/22;
   set_real_ip_from 104.16.0.0/13;
   set_real_ip_from 104.24.0.0/14;
   set_real_ip_from 108.162.192.0/18;
   set_real_ip_from 131.0.72.0/22;
   set_real_ip_from 141.101.64.0/18;
   set_real_ip_from 162.158.0.0/15;
   set_real_ip_from 172.64.0.0/13;
   set_real_ip_from 173.245.48.0/20;
   set_real_ip_from 188.114.96.0/20;
   set_real_ip_from 190.93.240.0/20;
   set_real_ip_from 197.234.240.0/22;
   set_real_ip_from 198.41.128.0/17;
   # IPv6
   set_real_ip_from 2400:cb00::/32;
   set_real_ip_from 2606:4700::/32;
   set_real_ip_from 2803:f800::/32;
   set_real_ip_from 2405:b500::/32;
   set_real_ip_from 2405:8100::/32;
   set_real_ip_from 2a06:98c0::/29;
   set_real_ip_from 2c0f:f248::/32;

   real_ip_header CF-Connecting-IP;
   ```

   (You can verify the latest list at https://www.cloudflare.com/ips/)

3. **Test and Reload Nginx**:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

## Phase 4: Application Configuration

### Backend (`server/.env`)

Update your environment variables to use your new domain:

- `CLIENT_URL=https://yourdomain.com` (or `https://www.yourdomain.com`)

### Frontend (`client/.env`)

Update your production API URL before building:

- `VITE_API_URL=https://yourdomain.com/api` (or `https://api.yourdomain.com` if you set up a subdomain)

### SSL/TLS in Cloudflare Dashboard

1. Go to the **SSL/TLS** tab in Cloudflare.
2. Set the encryption mode to **Full** or **Full (Strict)**.
   - **Full**: Encrypts end-to-end, but allows self-signed certificates on your VPS.
   - **Full (Strict)**: Requires a valid certificate (e.g., Let's Encrypt) on your VPS. Recommended if you already have Certbot set up.

## Summary Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] Nginx configured to trust Cloudflare IPs
- [ ] `.env` files updated with new domain URLs
- [ ] Frontend rebuilt and deployed
