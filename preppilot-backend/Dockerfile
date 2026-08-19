FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . /app

ENV FLASK_ENV=production
ENV FLASK_APP=wsgi:app
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["sh", "-c", "flask db upgrade && gunicorn wsgi:app --bind 0.0.0.0:${PORT:-5000} --workers 2"]
