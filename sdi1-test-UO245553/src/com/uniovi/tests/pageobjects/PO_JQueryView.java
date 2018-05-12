package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_JQueryView extends PO_NavView {
	static public void login(WebDriver driver, String emailp, String passwordp) {
		WebElement name = driver.findElement(By.id("email"));
		name.click();
		name.clear();
		name.sendKeys(emailp);
		WebElement lastname = driver.findElement(By.id("password"));
		lastname.click();
		lastname.clear();
		lastname.sendKeys(passwordp);
		// Pulsar el boton de Alta.
		By boton = By.id("boton-login");
		driver.findElement(boton).click();
	}

	static public void searchForm(WebDriver driver, String text) {
		WebElement name = driver.findElement(By.id("filtro-email"));
		name.click();
		name.clear();
		name.sendKeys(text);

		By boton = By.id("actualizarAmigos");
		driver.findElement(boton).click();
	}

	static public void chat(WebDriver driver) {
		By boton = By.xpath("//tbody/tr/td/a");
		driver.findElement(boton).click();
	}

	static public void crearMensaje(WebDriver driver, String text) {
		WebElement name = driver.findElement(By.id("textoMensaje"));
		name.click();
		name.clear();
		name.sendKeys(text);

		By boton = By.id("crearMensaje");
		driver.findElement(boton).click();
	}
}
