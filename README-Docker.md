
# Docker Deployment Guide for QA Flow Pilot

## Quick Start

1. **Build and run the application:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Local: http://localhost:3000
   - Public: http://YOUR_SERVER_IP:3000

## Deployment Options

### Option 1: Local Development/Testing
```bash
# Clone the repository
git clone <your-repo-url>
cd qa-flow-pilot

# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

### Option 2: Cloud VM Deployment (AWS EC2, DigitalOcean, etc.)

1. **Setup your VM:**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy the application:**
   ```bash
   git clone <your-repo-url>
   cd qa-flow-pilot
   docker compose up -d
   ```

3. **Configure firewall (if needed):**
   ```bash
   # For Ubuntu/Debian
   sudo ufw allow 3000
   sudo ufw enable
   
   # For CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   ```

### Option 3: Cloud Platforms

#### Railway
1. Connect your GitHub repository to Railway
2. Add environment variables if needed
3. Railway will auto-detect the Dockerfile and deploy

#### Render
1. Connect your GitHub repository
2. Choose "Web Service"
3. Set build command: `docker build -t qa-flow-pilot .`
4. Set start command: `docker run -p 3000:3000 qa-flow-pilot`

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Choose "Docker" as the source type
3. Set HTTP port to 3000

## Environment Variables

If you need to add environment variables, create a `.env` file:

```bash
# .env
NODE_ENV=production
PORT=3000
# Add any other environment variables here
```

Then update docker-compose.yml:
```yaml
services:
  qa-flow-pilot:
    # ... other configs
    env_file:
      - .env
```

## Useful Commands

```bash
# View running containers
docker ps

# View logs
docker compose logs qa-flow-pilot

# Restart the application
docker compose restart

# Update the application
git pull
docker compose down
docker compose up -d --build

# Clean up unused images
docker system prune -a
```

## Troubleshooting

1. **Port already in use:**
   ```bash
   # Check what's using port 3000
   sudo lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Application not accessible from outside:**
   - Check firewall settings
   - Ensure the port is exposed in docker-compose.yml
   - Verify your cloud provider's security groups/firewall rules

3. **Container keeps restarting:**
   ```bash
   # Check logs for errors
   docker compose logs qa-flow-pilot
   ```

## Security Considerations

For production deployment:
1. Use a reverse proxy (Nginx) for SSL termination
2. Configure proper firewall rules
3. Use environment variables for sensitive data
4. Consider using Docker secrets for production secrets
5. Regularly update the base Docker image

## Sharing with Your QA Team

Once deployed, share this URL format with your team:
- **Local network:** `http://YOUR_LOCAL_IP:3000`
- **Public deployment:** `http://YOUR_SERVER_IP:3000` or `https://your-domain.com`

Make sure your team can access the port (3000) through your network/firewall configuration.
