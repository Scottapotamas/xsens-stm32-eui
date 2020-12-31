# STM32 with xsens MTi IMU

This is an example project which acts as a basic implementation of my [`xsens-mti`](https://github.com/Scottapotamas/xsens-mti) library, running on a STM32F4 Discovery board.

This project also integrates [electricui-embedded](https://github.com/electricui/electricui-embedded) for realtime charting of variables from the STM32.

# Hardware

This project is intended for use with the ever-popular green [STM32F407 Discovery Board](https://www.st.com/en/evaluation-tools/stm32f4discovery.html).

A USB-UART adapter is needed to connect the STM32 to the PC for realtime display of data.

The IMU I used is a [xsens MTi-300-2A5G4](https://shop.xsens.com/shop/mti-100-series/mti-300-ahrs/mti-300-ahrs-2a8g4) (4th generation, RS232+USB, 450deg/sec), along with a [CA-MP2-MTi cable](https://shop.xsens.com/shop/mti-10-series/accessories/mti-10-series-accessories/ca-mp2-mti).

The IMU's RS232 connection is connected to a MAX232 transceiver IC which interfaces with one of the STM32's UART peripherals.

The IMU requires a 5-34V supply, drawing around 600mW.

# Firmware

## Setup

This repo does not contain the [`xsens-mti`](https://github.com/Scottapotamas/xsens-mti) or [electricui-embedded](https://github.com/electricui/electricui-embedded) libraries.

Download/clone them into `/firmware/vendor/xsens-mti` and `/firmware/vendor/electricui` respectively before use.

## Usage

TODO

## Notes

TODO

# Interface

## Setup

With [`arc`](https://electricui.com/install) installed, navigate a shell to `/interface` and run `arc install` to get everything setup.

## Usage

From `/interface`, run `arc start` from a shell to launch the development environment.

To build an executable bundle (production build), run `arc build`. The output will be put in `/interface/release/...`.


## Notes

TODO