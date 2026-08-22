FROM lycheeorg/lychee:v4.12.0
COPY dist/frontend.html /var/www/html/Lychee/public/dist/frontend.html
COPY dist/frontend.js /var/www/html/Lychee/public/dist/frontend.js
COPY dist/cover-custom.js /var/www/html/Lychee/public/dist/cover-custom.js
COPY views/frontend.blade.php /var/www/html/Lychee/resources/views/frontend.blade.php
