# Use the official WordPress image as a base
FROM wordpress:latest

# Remove the default themes to keep the image clean for headless usage.
# This prevents default theme files from appearing in the volume.
RUN rm -rf /var/www/html/wp-content/themes/*
