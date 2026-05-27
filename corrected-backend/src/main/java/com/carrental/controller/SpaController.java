package com.carrental.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // This catches top-level routes (like /login, /register)
    @GetMapping(value = "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }

    // This catches nested routes (like /admin/users)
    @GetMapping(value = "/*/{path:[^\\.]*}")
    public String forwardNested() {
        return "forward:/index.html";
    }
}