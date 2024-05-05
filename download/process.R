library(readr)
all_info <- read_csv("unsol_prior_cl.csv")
library(lme4)
m0 <- lmer (formula = cl ~ (1|pid) + (1|map), data = )
m1 <- lmer (formula = cl ~ soA + soB + soA * soB + (1|pid) + (1|map), data = unsol_time_cl)
m2 <- lmer (formula = cl ~ (1|pid) + (1|map) + obs, data = unsol_time_cl)
m3 <- lmer (formula = cl ~ (1|pid) + (1|map) + soA + soB + soA * soB + obs , data = unsol_time_cl)
anova(m0, m1, m2, m3)

