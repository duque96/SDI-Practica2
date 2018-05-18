package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_LoginView extends PO_NavView {
	static public void fillForm(WebDriver driver, String emailp, String passwordp) {
		WebElement name = driver.findElement(By.id("loginEmail"));
		name.click();
		name.clear();
		name.sendKeys(emailp);
		WebElement lastname = driver.findElement(By.id("loginPassword"));
		lastname.click();
		lastname.clear();
		lastname.sendKeys(passwordp);
		// Pulsar el boton de Alta.
		By boton = By.id("loginSubmit");
		driver.findElement(boton).click();
	}
}
