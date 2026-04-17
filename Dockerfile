# Use a lightweight Alpine NGINX image
FROM nginx:alpine

# Remove default NGINX configurations
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static web application files into NGINX's serving directory
COPY . /usr/share/nginx/html/

# Expose port (Cloud Run defaults to listening on 8080)
EXPOSE 8080

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
