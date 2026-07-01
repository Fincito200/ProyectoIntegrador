# ─────────────────────────────────────────────
# Stage 1 — Build con Maven
# ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copiar pom primero para cachear dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn package -DskipTests -q

# ─────────────────────────────────────────────
# Stage 2 — Imagen de producción (liviana)
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

# Puerto que expone Render
EXPOSE 8080

# Arrancar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]