# OrganizationTestTask
Необходимо изменить строку подключения к базе данных (connectionString) в файле App.config
```xml
  <connectionStrings>
    <add name="DefaultConnection" connectionString="Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=DataDb;Integrated Security=True;MultipleActiveResultSets=true"
        providerName="System.Data.SqlClient"/>
  </connectionStrings>
```
