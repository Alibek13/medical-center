import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Добавьте эти импорты
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

// Регистрируем русскую локаль
registerLocaleData(localeRu, 'ru');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));