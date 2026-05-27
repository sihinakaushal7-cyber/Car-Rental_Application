
package com.carrental.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Create a folder on your computer like C:/car-rental/images/
        // 2. This code tells Spring Boot: "If someone asks for /uploads/...,
        //    look inside that folder on my hard drive."
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/car-rental/images/");
    }
}