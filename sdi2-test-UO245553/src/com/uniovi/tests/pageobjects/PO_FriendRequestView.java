package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class PO_FriendRequestView extends PO_NavView {
	public static void clickBotonAceptar(WebDriver driver) {
		// Pulsar el boton de aceptar petición.
		By boton = By.id("btnAccept");
		driver.findElement(boton).click();
	}
}
